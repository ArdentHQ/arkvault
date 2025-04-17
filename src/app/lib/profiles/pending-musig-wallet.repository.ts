import { IProfile, IReadWriteWallet, IPendingMusigWalletRepository } from "./contracts.js";
import { IWalletData } from "./wallet.contract.js";
import { IWalletRepository } from "./wallet.repository.contract.js";
import { WalletRepository } from "./wallet.repository.js";

export class PendingMusigWalletRepository implements IPendingMusigWalletRepository {
	readonly #profile: IProfile;
	readonly #wallets: IWalletRepository;

	public constructor(profile: IProfile) {
		this.#wallets = new WalletRepository(profile);
		this.#profile = profile;
	}

	/** {@inheritDoc IPendingMusigWalletRepository.add} */
	public async add(address: string, coin: string, network: string) {
		if (this.#wallets.findByAddressWithNetwork(address, network)) {
			return;
		}

		this.#wallets.push(
			await this.#profile.walletFactory().fromAddress({
				coin,
				network,
				address,
			}),
		);
	}

	/** {@inheritDoc IPendingMusigWalletRepository.sync} */
	public async sync() {
		await this.#wallets.restore();

		for (const wallet of this.#wallets.values()) {
			await wallet.synchroniser().identity();

			if (wallet.hasSyncedWithNetwork()) {
				return this.#moveToWallets(wallet);
			}

			if (!(await this.#isWalletPending(wallet))) {
				return this.#wallets.forget(wallet.id());
			}
		}
	}

	/** {@inheritDoc IPendingMusigWalletRepository.fill} */
	public async fill(struct: Record<string, IWalletData> = {}): Promise<void> {
		return this.#wallets.fill(struct);
	}

	/** {@inheritDoc IPendingMusigWalletRepository.toObject} */
	public toObject() {
		return this.#wallets.toObject({
			addNetworkInformation: true,
			excludeEmptyWallets: false,
			excludeLedgerWallets: false,
		});
	}

	async #isWalletPending(wallet: IReadWriteWallet) {
		for (const profileWallet of this.#profile.wallets().values()) {
			await profileWallet.transaction().sync();

			for (const transaction of Object.values({ ...profileWallet.transaction().pending() })) {
				if (!transaction.isMultiSignatureRegistration()) {
					continue;
				}

				const { address } = await profileWallet
					.coin()
					.address()
					.fromMultiSignature(transaction.get<{ min: number; publicKeys: string[] }>("multiSignature"));

				if (address === wallet.address()) {
					return true;
				}
			}
		}

		return false;
	}

	async #moveToWallets(wallet: IReadWriteWallet) {
		if (this.#profile.wallets().findByAddressWithNetwork(wallet.address(), wallet.networkId())) {
			return this.#wallets.forget(wallet.id());
		}

		wallet.mutator().alias(this.#makeAlias(wallet));

		this.#profile.wallets().push(wallet, { force: true });
		this.#wallets.forget(wallet.id());
		await this.#profile.wallets().restore();
	}

	#makeAlias(wallet: IReadWriteWallet) {
		const alias = (count: number) => `${wallet.network().displayName()} #${count}`;

		let counter = this.#profile.wallets().findByCoinWithNetwork(wallet.coinId(), wallet.networkId()).length;

		if (counter === 0) {
			counter = 1;
		}

		while (this.#profile.wallets().findByAlias(alias(counter))) {
			counter++;
		}

		return alias(counter);
	}
}
