import { Contracts, Environment } from "@/app/lib/profiles";
import { BIP44 } from "@ardenthq/arkvault-crypto";
import { AddressService } from "./address.service";
import { DraftTransfer } from "./draft-transfer";
import { DataRepository } from "@/app/lib/profiles/data.repository";

export class LedgerMigrator {
	#profile: Contracts.IProfile;
	#env: Environment;
	#transactions: DraftTransfer[];
	#generatedAddresses: DataRepository;

	constructor({ profile, env }: { profile: Contracts.IProfile, env: Environment }) {
		this.#profile = profile;
		this.#env = env;
		this.#transactions = [];
		this.#generatedAddresses = new DataRepository()
	}

	public migratePath(path: string, slip44: number): string {
		const existingPath = BIP44.parse(path)
		return BIP44.stringify({
			...existingPath,
			coinType: slip44,
			index: existingPath.addressIndex
		})
	}

	public async findOrCreate(address: string, path: string): Promise<Contracts.IReadWriteWallet> {
		const existingWallet = this.#profile.wallets().values().find(wallet => wallet.address() === address)
		return existingWallet ?? await this.createWallet(address, path)
	}

	public async createWallet(address: string, path: string): Promise<Contracts.IReadWriteWallet> {
		return await this.#profile.walletFactory().fromAddressWithDerivationPath({
			address,
			path,
		})
	}

	public async generateFromLedger(newPath: string): Promise<Contracts.IReadWriteWallet> {
		const publicKey = await this.#profile.ledger().getExtendedPublicKey(newPath)
		const { address } = new AddressService().fromPublicKey(publicKey);
		const wallet = await this.createWallet(address, newPath)

		wallet.mutator().alias(wallet.generateAlias())

		return wallet
	}

	public async createMigrationTransaction(address: string, path: string): Promise<DraftTransfer> {
		const sender = await this.findOrCreate(address, path)
		const newPath = this.migratePath(path, this.#profile.ledger().slip44Eth())
		const cachedAddress = this.#generatedAddresses.get<string | undefined>(newPath)

		const recipient = cachedAddress
			? await this.createWallet(cachedAddress, newPath)
			: await this.generateFromLedger(newPath)

		this.#generatedAddresses.set(newPath, recipient.address())

		const transaction = new DraftTransfer({ env: this.#env, profile: this.#profile })

		transaction.setSender(sender)
		transaction.addRecipientWallet(recipient)
		transaction.setAmount(1) // TODO: change to full sender's balance after testing.

		return transaction
	}

	public addTransaction(transaction: DraftTransfer): void {
		this.#transactions.push(transaction)
	}

	public transactions(): DraftTransfer[] {
		return this.#transactions
	}

	public firstTransaction(): DraftTransfer | undefined {
		return this.#transactions.at(0)
	}

	public reset(): void {
		this.#transactions = [];
	}
}
