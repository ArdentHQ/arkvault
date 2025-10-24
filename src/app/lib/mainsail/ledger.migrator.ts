import { Contracts, Environment } from "@/app/lib/profiles";
import { BIP44 } from "@ardenthq/arkvault-crypto";
import { AddressService } from "./address.service";
import { DraftTransfer } from "./draft-transfer";
import { DataRepository } from "@/app/lib/profiles/data.repository";
import { sortBy } from "@/app/lib/helpers";
import { WalletData } from "@/app/lib/profiles/wallet.enum";

export class MigrationTransaction extends DraftTransfer {
	#isPending: boolean = false;
	#isCompleted: boolean = false;

	public override isPending(): boolean {
		if (this.isCompleted()) {
			return false;
		}
		return this.#isPending;
	}

	public isPendingConfirmation(): boolean {
		if (this.isCompleted()) {
			return false;
		}

		return !!this.signedTransaction() && !this.signedTransaction()?.isConfirmed();
	}

	public override isCompleted() {
		return this.#isCompleted;
	}

	public setIsPending(isPending: boolean) {
		this.#isPending = isPending;
	}

	public setIsCompleted(isCompleted: boolean) {
		this.#isCompleted = isCompleted;
	}
}

export class LedgerMigrator {
	#env: Environment;
	#profile: Contracts.IProfile;
	#transactions: MigrationTransaction[];
	#currentTransaction: MigrationTransaction | undefined;
	#generatedAddresses: DataRepository;

	constructor({ profile, env }: { profile: Contracts.IProfile; env }) {
		this.#env = env;
		this.#profile = profile;
		this.#transactions = [];
		this.#generatedAddresses = new DataRepository();
		this.#currentTransaction = undefined;
	}

	public migratePath(path: string, slip44: number, newIndex: number): string {
		const existingPath = BIP44.parse(path);
		return BIP44.stringify({
			...existingPath,
			coinType: slip44,
			index: newIndex,
		});
	}

	public async findOrCreate(address: string, path: string): Promise<Contracts.IReadWriteWallet> {
		const existingWallet = this.#profile
			.wallets()
			.values()
			.find((wallet) => wallet.address() === address);
		return existingWallet ?? (await this.createWallet(address, path));
	}

	public async createWallet(address: string, path: string): Promise<Contracts.IReadWriteWallet> {
		return await this.#profile.walletFactory().fromAddressWithDerivationPath({
			address,
			path,
		});
	}

	public async generateFromLedger(newPath: string): Promise<Contracts.IReadWriteWallet> {
		const publicKey = await this.#profile.ledger().getExtendedPublicKey(newPath);
		const { address } = new AddressService().fromPublicKey(publicKey);
		const wallet = await this.createWallet(address, newPath);

		wallet.mutator().alias(wallet.generateAlias());

		return wallet;
	}

	#sortAddressesByPath(addresses: { address: string; path: string }[]) {
		return sortBy(addresses, ({ path }) => path);
	}

	public async createTransaction(
		senderAddress: string,
		senderPath: string,
		recipientPath: string,
	): Promise<MigrationTransaction> {
		const senderWallet = await this.findOrCreate(senderAddress, senderPath);
		const cachedRecipient = this.#generatedAddresses.get<string | undefined>(recipientPath);

		const recipientWallet = cachedRecipient
			? await this.createWallet(cachedRecipient, recipientPath)
			: await this.generateFromLedger(recipientPath);

		this.#generatedAddresses.set(recipientPath, recipientWallet.address());

		const transaction = new MigrationTransaction({ env: this.#env, profile: this.#profile });

		transaction.setSender(senderWallet);
		transaction.addRecipientWallet(recipientWallet);
		transaction.setAmount(1); // TODO: change to full senderWallet's balance after testing.

		return transaction;
	}

	public async createTransactions(
		addresses: { address: string; path: string }[],
		migrateToOne?: boolean,
	): Promise<void> {
		const migratingAddresses = this.#sortAddressesByPath(addresses);

		if (migratingAddresses.length === 0) {
			return;
		}

		// Start with the min path of the given list,
		// and incrementing by 1 for the migrated addresses not to have gaps.
		let currentIndex = BIP44.parse(migratingAddresses[0].path).addressIndex;
		let firstRecipient: Contracts.IReadWriteWallet | undefined = undefined;

		for (const { address, path } of migratingAddresses) {
			const newPath =
				!!migrateToOne && !!firstRecipient
					? (firstRecipient?.data().get(WalletData.DerivationPath) as string)
					: this.migratePath(path, this.#profile.ledger().slip44Eth(), currentIndex);

			const transaction = await this.createTransaction(address, path, newPath);
			this.addTransaction(transaction);

			if (!firstRecipient) {
				firstRecipient = transaction.recipient();
			}

			// Keep the same path as the recipient wallet.
			if (migrateToOne) {
				continue;
			}

			currentIndex = currentIndex + 1;
		}
	}

	public addTransaction(transaction: MigrationTransaction): void {
		this.#transactions.push(transaction);
	}

	public transactions(): MigrationTransaction[] {
		return sortBy(this.#transactions, (transaction) =>
			transaction.recipient()?.data().get(WalletData.DerivationPath),
		);
	}

	public currentTransaction(): MigrationTransaction | undefined {
		return this.#currentTransaction;
	}

	public currentTransactionIndex(): number {
		return this.transactions().findIndex(
			(transaction) => this.#currentTransaction?.sender().address() === transaction.sender().address(),
		);
	}

	public nextTransaction(): MigrationTransaction | undefined {
		if (this.transactions().length === 0) {
			return undefined;
		}

		const currentIndex = this.currentTransactionIndex();
		const nextIndex = (currentIndex + 1) % this.transactions().length;
		this.#currentTransaction = this.transactions().at(nextIndex);
		return this.#currentTransaction;
	}

	public isMigrationComplete(): boolean {
		return this.transactions().every((transaction) => transaction.isCompleted());
	}

	public async importMigratedWallets(): Promise<void> {
		for (const transaction of this.transactions().filter((transaction) => transaction.isCompleted())) {
			const wallet = transaction.recipient();

			if (!wallet) {
				continue;
			}

			if (
				this.#profile
					.wallets()
					.values()
					.some((profileWallet) => wallet.address() === profileWallet.address())
			) {
				continue;
			}

			wallet.mutator().alias(wallet.generateAlias());
			this.#profile.wallets().push(wallet);
		}
	}

	public flush(): void {
		this.#transactions = [];
		this.#generatedAddresses.flush();
		this.#currentTransaction = undefined;
	}

	public flushTransactions(): void {
		this.#transactions = [];
	}
}
