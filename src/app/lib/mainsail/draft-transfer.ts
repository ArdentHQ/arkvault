import { Networks } from "@/app/lib/mainsail";
import { IProfile } from "@/app/lib/profiles/profile.contract.js";
import { Contracts, Environment } from "@/app/lib/profiles";
import { BigNumber } from "@/app/lib/helpers";
import { TransactionFeeService } from "./transaction-fee.service";
import { TransactionFee } from "./fee.contract";
import { assertNumber, assertWallet } from "@/utils/assertions";
import { ExtendedSignedTransactionData } from "@/app/lib/profiles/signed-transaction.dto";
import { handleBroadcastError } from "@/domains/transaction/utils";

export interface RecipientItem {
	address: string;
	amount?: number;
}

export class DraftTransfer {
	readonly #env: Environment;
	readonly #profile: Contracts.IProfile;

	#senderWallet?: Contracts.IReadWriteWallet;
	#recipientWallets: Contracts.IReadWriteWallet[] = [];
	#memo?: string;
	#gasLimit?: BigNumber;
	#amount: number = 0;
	#fees?: TransactionFee;
	#selectedFee?: keyof TransactionFee;
	#signedTransaction?: ExtendedSignedTransactionData;

	public constructor({ profile, env }: { profile: IProfile; env: Environment }) {
		this.#env = env;
		this.#profile = profile;
		this.reset();
	}

	public addRecipientWallet(wallet: Contracts.IReadWriteWallet): void {
		this.#recipientWallets?.push(wallet);
	}

	public addRecipientWallets(wallets: Contracts.IReadWriteWallet[]): void {
		for (const wallet of wallets) {
			this.#recipientWallets?.push(wallet);
		}
	}

	public setSender(wallet: Contracts.IReadWriteWallet): void {
		this.#senderWallet = wallet;
	}

	public setAmount(amount: number): void {
		this.#amount = amount;
	}

	public setMemo(memo: string): void {
		this.#memo = memo;
	}

	public selectFee(type: keyof TransactionFee): void {
		this.#selectedFee = type;
	}

	public async calculateFees(): Promise<void> {
		const firstRecipient = this.recipient();
		assertWallet(firstRecipient);

		const feeService = new TransactionFeeService({
			env: this.#env,
			network: this.sender().network(),
			profile: this.#profile,
		});

		this.#fees = await feeService.calculateFees("transfer");

		this.#gasLimit = await feeService.gasLimit(
			{
				recipientAddress: firstRecipient.address(),
				senderAddress: this.sender().address(),
			},
			"transfer",
		);
	}

	public async sign(input?: {
		key?: string;
		secondKey?: string;
		encryptionPassword?: string;
	}): Promise<ExtendedSignedTransactionData> {
		const firstRecipient = this.recipient();

		assertWallet(firstRecipient);
		assertNumber(this.amount());

		const signatory = await this.sender().signatoryFactory().fromSigningKeys(input);

		const hash = await this.sender()
			.transaction()
			.signTransfer({
				data: {
					amount: this.amount(),
					memo: this.memo(),
					to: firstRecipient.address(),
				},
				gasLimit: this.gasLimit(),
				gasPrice: this.selectedFee(),
				signatory,
			});

		this.#signedTransaction = this.sender().transaction().transaction(hash);
		return this.#signedTransaction;
	}

	public async broadcast(transaction: ExtendedSignedTransactionData): Promise<ExtendedSignedTransactionData> {
		const response = await transaction.wallet().transaction().broadcast(transaction.hash());
		handleBroadcastError(response);
		return transaction;
	}

	public async signAndBroadcast(input?: {
		key?: string;
		secondKey?: string;
		encryptionPassword?: string;
	}): Promise<ExtendedSignedTransactionData> {
		const transaction = await this.sign(input);
		return await this.broadcast(transaction);
	}

	public fees(): TransactionFee | undefined {
		return this.#fees;
	}

	public gasLimit(): BigNumber | undefined {
		return this.#gasLimit;
	}

	public memo(): string | undefined {
		return this.#memo;
	}

	public sender(): Contracts.IReadWriteWallet {
		assertWallet(this.#senderWallet);
		return this.#senderWallet;
	}

	public network(): Networks.Network {
		return this.sender().network();
	}

	public confirmationTime(type: keyof TransactionFee): number | undefined {
		return this.network()?.fees().confirmationTime(type, this.network()?.blockTime());
	}

	public selectedFee(): BigNumber | undefined {
		if (!this.#fees || !this.#selectedFee) {
			return undefined;
		}

		return this.#fees[this.#selectedFee];
	}

	public recipient(): Contracts.IReadWriteWallet | undefined {
		return this.recipientWallets().at(0);
	}

	public recipientWallets(): Contracts.IReadWriteWallet[] {
		return this.#recipientWallets;
	}

	public amount(): number {
		return this.#amount;
	}

	public signedTransaction(): ExtendedSignedTransactionData | undefined {
		return this.#signedTransaction;
	}

	public isCompleted(): boolean {
		return !!this.#signedTransaction && !this.#signedTransaction.isConfirmed();;
	}

	public isPending(): boolean {
		return !!this.#signedTransaction && !this.#signedTransaction.isConfirmed();
	}

	public reset(): void {
		this.#recipientWallets = [];
		this.#senderWallet = undefined;
		this.#memo = undefined;
		this.#gasLimit = undefined;
		this.#fees = undefined;
		this.#selectedFee = undefined;
	}
}
