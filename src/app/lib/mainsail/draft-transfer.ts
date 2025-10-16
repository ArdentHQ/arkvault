import { Networks } from "@/app/lib/mainsail";
import { IProfile } from "@/app/lib/profiles/profile.contract.js";
import { Contracts, Environment } from "@/app/lib/profiles";
import { BigNumber } from "@/app/lib/helpers";
import { TransactionFeeService } from "./transaction-fee.service";
import { TransactionFee } from "./fee.contract";
import { assertNumber, assertString, assertWallet } from "@/utils/assertions";
import { ExtendedSignedTransactionData } from "@/app/lib/profiles/signed-transaction.dto";
import { handleBroadcastError } from "@/domains/transaction/utils";

export interface RecipientItem {
	address: string;
	amount?: number;
}

export class DraftTransfer {
	readonly #env: Environment;
	readonly #profile: Contracts.IProfile;

	#recipients: RecipientItem[];
	#senderWallet?: Contracts.IReadWriteWallet;
	#memo?: string;
	#gasLimit?: BigNumber;
	#fees?: TransactionFee;
	#selectedFee?: keyof TransactionFee;

	public constructor({ profile, env }: { profile: IProfile; env: Environment }) {
		this.#env = env;
		this.#profile = profile;
		this.#recipients = [];
		this.reset();
	}

	public addRecipient(address: string, amount: number): void {
		this.#recipients.push({
			address,
			amount,
		});
	}

	public setSender(wallet: Contracts.IReadWriteWallet): void {
		this.#senderWallet = wallet;
	}

	public setMemo(memo: string): void {
		this.#memo = memo;
	}

	public selectFee(type: keyof TransactionFee): void {
		this.#selectedFee = type;
	}

	public async calculateFees(): Promise<void> {
		const feeService = new TransactionFeeService({
			env: this.#env,
			network: this.sender().network(),
			profile: this.#profile,
		});

		this.#fees = await feeService.calculateFees("transfer");

		this.#gasLimit = await feeService.gasLimit(
			{
				recipientAddress: this.#recipients.at(0)?.address,
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
		const firstRecipient = this.recipientsWithAmounts().at(0);

		assertNumber(firstRecipient?.amount);
		assertString(firstRecipient?.address);

		const signatory = await this.sender().signatoryFactory().fromSigningKeys(input);

		const hash = await this.sender().transaction().signTransfer({
			data: {
				amount: firstRecipient.amount,
				memo: this.memo(),
				to: firstRecipient.address,
			},
			gasLimit: this.gasLimit(),
			gasPrice: this.selectedFee(),
			signatory,
		});

		return this.sender().transaction().transaction(hash);
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
		assertWallet(this.#senderWallet)
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

	public recipientAddress(): string | undefined {
		return this.#recipients.at(0)?.address;
	}

	public recipientsWithAmounts(): RecipientItem[] {
		return this.#recipients;
	}

	public reset(): void {
		this.#recipients = [];
		this.#senderWallet = undefined;
		this.#memo = undefined;
		this.#gasLimit = undefined;
		this.#fees = undefined;
		this.#selectedFee = undefined;
	}
}
