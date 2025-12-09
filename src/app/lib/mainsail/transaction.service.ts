import {
	AbiEncoder,
	ContractAddresses,
	EvmCallBuilder,
	MultipaymentBuilder,
	Network,
	TransferBuilder,
	UnitConverter,
	UnvoteBuilder,
	UsernameRegistrationBuilder,
	UsernameResignationBuilder,
	ValidatorRegistrationBuilder,
	ValidatorResignationBuilder,
	VoteBuilder,
} from "@arkecosystem/typescript-crypto";
import { BigNumber, get } from "@/app/lib/helpers";

import { AddressService } from "./address.service.js";
import { ClientService } from "./client.service.js";
import { ConfigRepository } from "@/app/lib/mainsail";
import { IProfile } from "@/app/lib/profiles/profile.contract.js";
import { Services } from "@/app/lib/mainsail";
import { SignedTransactionData } from "./signed-transaction.dto";
import { HDWalletService } from "@/app/lib/mainsail/hd-wallet.service";
import { NetworkConfig } from "@/app/lib/mainsail/network-config";

interface ValidatedTransferInput extends Services.TransferInput {
	gasPrice: BigNumber;
	gasLimit: BigNumber;
}

type TransactionsInputs =
	| Services.TransferInput
	| Services.VoteInput
	| Services.ValidatorRegistrationInput
	| Services.ValidatorResignationInput;

export class TransactionService {
	readonly #ledgerService!: Services.LedgerService;
	readonly hdWalletService!: HDWalletService;
	readonly #addressService!: AddressService;
	readonly #clientService!: ClientService;

	public constructor({ config, profile }: { config: ConfigRepository; profile: IProfile }) {
		this.#ledgerService = profile.ledger();
		this.#addressService = new AddressService();
		this.#clientService = new ClientService({ config, profile });
		this.hdWalletService = new HDWalletService({ config });

		// set Network instance for `typescript-crypto`
		Network.set(new NetworkConfig(config));
	}

	#assertGasFee(input: TransactionsInputs): asserts input is ValidatedTransferInput {
		if (!input.gasPrice) {
			throw new Error(
				`[TransactionService#transfer] Expected gasPrice to be defined but received ${typeof input.gasPrice}`,
			);
		}

		if (!input.gasLimit) {
			throw new Error(
				`[TransactionService#transfer] Expected gasLimit to be defined but received ${typeof input.gasLimit}`,
			);
		}
	}

	#assertAmount(input: Services.TransferInput): asserts input is ValidatedTransferInput {
		if (!input.data.amount) {
			throw new Error(
				`[TransactionService#transfer] Expected amount to be defined but received ${typeof input.data.amount}`,
			);
		}
	}

	public async transfer(input: Services.TransferInput): Promise<SignedTransactionData> {
		this.#assertGasFee(input);
		this.#assertAmount(input);

		const nonce = await this.#generateNonce(input);

		const builder = TransferBuilder.new()
			.value(UnitConverter.parseUnits(input.data.amount, "ark"))
			.to(input.data.to)
			.nonce(nonce)
			.gasPrice(UnitConverter.parseUnits(input.gasPrice.toString(), "gwei"))
			// @TODO https://app.clickup.com/t/86dwvx1ya get rid of .toString() for all `gas` calls
			.gasLimit(input.gasLimit.toString());

		await this.#sign(input, builder);

		return new SignedTransactionData().configure(
			builder.transaction.data,
			builder.transaction.serialize().toString("hex"),
		);
	}

	public async validatorRegistration(input: Services.ValidatorRegistrationInput): Promise<SignedTransactionData> {
		this.#assertGasFee(input);

		if (!input.data.validatorPublicKey) {
			throw new Error(
				`[TransactionService#validatorRegistration] Expected validatorPublicKey to be defined but received ${typeof input
					.data.validatorPublicKey}`,
			);
		}

		const nonce = await this.#generateNonce(input);

		const builder = await ValidatorRegistrationBuilder.new()
			.validatorPublicKey(`0x${input.data.validatorPublicKey}`)
			.nonce(nonce)
			.gasPrice(UnitConverter.parseUnits(input.gasPrice.toString(), "gwei"))
			.gasLimit(input.gasLimit.toString())
			.value(input.data.value);

		await this.#sign(input, builder);

		return new SignedTransactionData().configure(
			builder.transaction.data,
			builder.transaction.serialize().toString("hex"),
		);
	}

	public async updateValidator(input: Services.UpdateValidatorInput): Promise<SignedTransactionData> {
		this.#assertGasFee(input);

		if (!input.data.validatorPublicKey) {
			throw new Error(
				`[TransactionService#updateValidator] Expected validatorPublicKey to be defined but received ${typeof input
					.data.validatorPublicKey}`,
			);
		}

		const nonce = await this.#generateNonce(input);

		const builder = await EvmCallBuilder.new({
			senderPublicKey: "",
			value: "0",
		})

			.to(ContractAddresses.CONSENSUS)
			.payload(new AbiEncoder().encodeFunctionCall("updateValidator", [`0x${input.data.validatorPublicKey}`]))
			.nonce(nonce)
			.gasPrice(UnitConverter.parseUnits(input.gasPrice.toString(), "gwei"))
			.gasLimit(input.gasLimit.toString());

		await this.#sign(input, builder);

		return new SignedTransactionData().configure(
			builder.transaction.data,
			builder.transaction.serialize().toString("hex"),
		);
	}

	/**
	 * @inheritDoc
	 */
	public async vote(input: Services.VoteInput): Promise<SignedTransactionData> {
		this.#assertGasFee(input);

		const vote: { id: string } | undefined = get(input, "data.votes[0]");
		const unvote: { id: string } | undefined = get(input, "data.unvotes[0]");
		const nonce = await this.#generateNonce(input);

		if (unvote && !vote) {
			const builder = await UnvoteBuilder.new()
				.nonce(nonce)
				.gasPrice(UnitConverter.parseUnits(input.gasPrice.toString(), "gwei"))
				.gasLimit(input.gasLimit.toString());

			await this.#sign(input, builder);

			return new SignedTransactionData().configure(
				builder.transaction.data,
				builder.transaction.serialize().toString("hex"),
			);
		}

		const builder = await VoteBuilder.new()
			.vote(vote?.id)
			.nonce(nonce)
			.gasPrice(UnitConverter.parseUnits(input.gasPrice.toString(), "gwei"))
			.gasLimit(input.gasLimit.toString());

		await this.#sign(input, builder);

		return new SignedTransactionData().configure(
			builder.transaction.data,
			builder.transaction.serialize().toString("hex"),
		);
	}

	/**
	 * @inheritDoc
	 */
	public async multiPayment(input: Services.MultiPaymentInput): Promise<SignedTransactionData> {
		this.#assertGasFee(input);

		if (!input.data.payments) {
			throw new Error(
				`[TransactionService#multiPayment] Expected payments to be defined but received ${typeof input.data
					.payments}`,
			);
		}

		const nonce = await this.#generateNonce(input);

		const builder = MultipaymentBuilder.new()
			.nonce(nonce)
			.gasPrice(UnitConverter.parseUnits(input.gasPrice.toString(), "gwei"))
			.gasLimit(input.gasLimit.toString());

		for (const payment of input.data.payments) {
			builder.pay(payment.to, UnitConverter.parseUnits(payment.amount, "ark"));
		}

		await this.#sign(input, builder);

		return new SignedTransactionData().configure(
			builder.transaction.data,
			builder.transaction.serialize().toString("hex"),
		);
	}

	public async usernameRegistration(input: Services.UsernameRegistrationInput): Promise<SignedTransactionData> {
		this.#assertGasFee(input);

		if (!input.data.username) {
			throw new Error(
				`[TransactionService#validatorRegistration] Expected username to be defined but received ${typeof input
					.data.username}`,
			);
		}

		const nonce = await this.#generateNonce(input);

		const builder = await UsernameRegistrationBuilder.new()
			.username(input.data.username)
			.nonce(nonce)
			.gasPrice(UnitConverter.parseUnits(input.gasPrice.toString(), "gwei"))
			.gasLimit(input.gasLimit.toString());

		await this.#sign(input, builder);

		return new SignedTransactionData().configure(
			builder.transaction.data,
			builder.transaction.serialize().toString("hex"),
		);
	}

	public async usernameResignation(input: Services.UsernameResignationInput): Promise<SignedTransactionData> {
		this.#assertGasFee(input);

		const nonce = await this.#generateNonce(input);

		const builder = await UsernameResignationBuilder.new()
			.nonce(nonce)
			.gasPrice(UnitConverter.parseUnits(input.gasPrice.toString(), "gwei"))
			.gasLimit(input.gasLimit.toString())
			.sign(input.signatory.signingKey());

		await this.#sign(input, builder);

		return new SignedTransactionData().configure(
			builder.transaction.data,
			builder.transaction.serialize().toString("hex"),
		);
	}

	public async validatorResignation(input: Services.ValidatorResignationInput): Promise<SignedTransactionData> {
		this.#assertGasFee(input);

		const nonce = await this.#generateNonce(input);

		const builder = await ValidatorResignationBuilder.new()
			.nonce(nonce)
			.gasPrice(UnitConverter.parseUnits(input.gasPrice.toString(), "gwei"))
			.gasLimit(input.gasLimit.toString())
			.sign(input.signatory.signingKey());

		await this.#sign(input, builder);

		return new SignedTransactionData().configure(
			builder.transaction.data,
			builder.transaction.serialize().toString("hex"),
		);
	}

	public async contractDeployment(input: Services.ContractDeploymentInput): Promise<SignedTransactionData> {
		this.#assertGasFee(input);

		const nonce = await this.#generateNonce(input);

		const builder = await EvmCallBuilder.new()
			.nonce(nonce)
			.payload(input.data.bytecode)
			.gasPrice(UnitConverter.parseUnits(input.gasPrice.toString(), "gwei"))
			.gasLimit(input.gasLimit.toString())
			.sign(input.signatory.signingKey());

		await this.#sign(input, builder);

		return new SignedTransactionData().configure(
			builder.transaction.data,
			builder.transaction.serialize().toString("hex"),
		);
	}

	async #signerData(input: Services.TransactionInputs): Promise<{ address?: string }> {
		let address: string | undefined;

		if (input.signatory.actsWithBip44Mnemonic()) {
			address = this.hdWalletService.getAddress(input.signatory.signingKey(), input.signatory.path());
		}

		if (input.signatory.actsWithMnemonic() || input.signatory.actsWithConfirmationMnemonic()) {
			address = this.#addressService.fromMnemonic(input.signatory.signingKey()).address;
		}

		if (input.signatory.actsWithSecret() || input.signatory.actsWithConfirmationSecret()) {
			address = this.#addressService.fromSecret(input.signatory.signingKey()).address;
		}

		if (input.signatory.actsWithLedger()) {
			await this.#ledgerService.connect();
			const extendedPublicKey = await this.#ledgerService.getExtendedPublicKey(input.signatory.signingKey());
			address = this.#addressService.fromPublicKey(extendedPublicKey).address;
		}

		return { address };
	}

	async #generateNonce(input: Services.TransactionInputs): Promise<string> {
		if (input.nonce) {
			return input.nonce;
		}

		const { address } = await this.#signerData(input);
		const wallet = await this.#clientService.wallet({ type: "address", value: address! });

		return wallet.nonce().toFixed(0);
	}

	async #sign(input: Services.TransferInput, builder: any): Promise<void> {
		const { address } = await this.#signerData(input);
		builder.transaction.data.from = address;

		if (input.signatory.actsWithBip44Mnemonic()) {
			return this.#signWithHDWallet(input, builder.transaction);
		}

		if (input.signatory.actsWithLedger()) {
			return this.#signWithLedger(input, builder.transaction);
		}

		if (input.signatory.actsWithConfirmationMnemonic() || input.signatory.actsWithConfirmationSecret()) {
			return await builder.legacySecondSign(input.signatory.signingKey(), input.signatory.confirmKey());
		}

		await builder.sign(input.signatory.signingKey());
	}

	async #signWithLedger(input: Services.TransferInput, transaction: any): Promise<void> {
		const signature = await this.#ledgerService.sign(
			input.signatory.signingKey(),
			transaction.serialize().toString("hex"),
		);

		transaction.data = {
			...transaction.data,
			...signature,
		};

		transaction.data.hash = transaction.hash();
	}

	async #signWithHDWallet(input: Services.TransferInput, transaction: any): Promise<void> {
		const signature = await this.hdWalletService.sign(
			input.signatory.signingKey(),
			input.signatory.path(),
			transaction.data,
		);

		transaction.data = {
			...transaction.data,
			...signature,
		};

		transaction.data.hash = transaction.hash();
	}
}
