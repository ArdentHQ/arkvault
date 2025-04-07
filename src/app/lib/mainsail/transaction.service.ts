import { Contracts, IoC, Services } from "@ardenthq/sdk";
import { BigNumber } from "@ardenthq/sdk-helpers";
import { Utils } from "@mainsail/crypto-transaction";
import { EvmCallBuilder } from "@mainsail/crypto-transaction-evm-call";
import { ConsensusAbi, MultiPaymentAbi, UsernamesAbi } from "@mainsail/evm-contracts";
import { Application } from "@mainsail/kernel";
import { encodeFunctionData } from "viem";

import { BindingType } from "./coin.contract.js";
import { applyCryptoConfiguration } from "./config.js";
import { Interfaces } from "./crypto/index.js";
import { parseUnits } from "./helpers/parse-units.js";
import { Request } from "./request.js";

const wellKnownContracts = {
	consensus: "0x535B3D7A252fa034Ed71F0C53ec0C6F784cB64E1",
	multiPayment: "0x00EFd0D4639191C49908A7BddbB9A11A994A8527",
	username: "0x2c1DE3b4Dbb4aDebEbB5dcECAe825bE2a9fc6eb6",
};

interface ValidatedTransferInput extends Services.TransferInput {
	gasPrice: number;
	gasLimit: number;
}

type TransactionsInputs =
	| Services.TransferInput
	| Services.VoteInput
	| Services.ValidatorRegistrationInput
	| Services.ValidatorResignationInput;

export class TransactionService extends Services.AbstractTransactionService {
	readonly #ledgerService!: Services.LedgerService;
	readonly #addressService!: Services.AddressService;
	readonly #publicKeyService!: Services.PublicKeyService;
	readonly #request: Request;
	readonly #app: Application;

	#configCrypto!: { crypto: Interfaces.NetworkConfig; height: number };

	public constructor(container: IoC.IContainer) {
		super(container);

		this.#ledgerService = container.get(IoC.BindingType.LedgerService);
		this.#addressService = container.get(IoC.BindingType.AddressService);
		this.#publicKeyService = container.get(IoC.BindingType.PublicKeyService);
		this.#app = container.get(BindingType.Application);

		this.#configCrypto = {
			crypto: container.get(BindingType.Crypto),
			height: container.get(BindingType.Height),
		};

		this.#request = new Request(
			container.get(IoC.BindingType.ConfigRepository),
			container.get(IoC.BindingType.HttpClient),
			container.get(IoC.BindingType.NetworkHostSelector),
		);
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

	public override async transfer(input: Services.TransferInput): Promise<Contracts.SignedTransactionData> {
		applyCryptoConfiguration(this.#configCrypto);
		this.#assertGasFee(input);
		this.#assertAmount(input);

		const transaction = this.#app.resolve(EvmCallBuilder);

		const { address } = await this.#signerData(input);
		const nonce = await this.#generateNonce(address, input);

		transaction
			.network(this.#configCrypto.crypto.network.chainId)
			.gasLimit(input.gasLimit)
			.recipientAddress(input.data.to)
			.payload("")
			.nonce(nonce)
			.value(parseUnits(input.data.amount, "ark").valueOf())
			.gasPrice(parseUnits(input.gasPrice, "gwei").toNumber());

		return this.#buildTransaction(input, transaction);
	}

	public override async validatorRegistration(
		input: Services.ValidatorRegistrationInput,
	): Promise<Contracts.SignedTransactionData> {
		applyCryptoConfiguration(this.#configCrypto);
		this.#assertGasFee(input);

		if (!input.data.validatorPublicKey) {
			throw new Error(
				`[TransactionService#validatorRegistration] Expected validatorPublicKey to be defined but received ${typeof input
					.data.validatorPublicKey}`,
			);
		}

		const transaction = this.#app.resolve(EvmCallBuilder);

		const { address } = await this.#signerData(input);
		const nonce = await this.#generateNonce(address, input);

		const data = encodeFunctionData({
			abi: ConsensusAbi.abi,
			args: [`0x${input.data.validatorPublicKey}`],
			functionName: "registerValidator",
		});

		transaction
			.network(this.#configCrypto.crypto.network.chainId)
			.gasLimit(input.gasLimit)
			.recipientAddress(wellKnownContracts.consensus)
			.payload(data.slice(2))
			.nonce(nonce)
			.gasPrice(parseUnits(input.gasPrice, "gwei").toNumber());

		return this.#buildTransaction(input, transaction);
	}

	public override async delegateRegistration(
		input: Services.ValidatorRegistrationInput,
	): Promise<Contracts.SignedTransactionData> {
		return this.validatorRegistration(input);
	}

	/**
	 * @inheritDoc
	 */
	public override async vote(input: Services.VoteInput): Promise<Contracts.SignedTransactionData> {
		applyCryptoConfiguration(this.#configCrypto);
		this.#assertGasFee(input);

		const transaction = this.#app.resolve(EvmCallBuilder);

		const { address } = await this.#signerData(input);
		const nonce = await this.#generateNonce(address, input);

		const vote = input.data.votes?.at(0);
		const isVote = !!vote;

		const data = encodeFunctionData({
			abi: ConsensusAbi.abi,
			args: isVote ? [vote.id] : [],
			functionName: isVote ? "vote" : "unvote",
		});

		transaction
			.network(this.#configCrypto.crypto.network.chainId)
			.recipientAddress(wellKnownContracts.consensus)
			.gasLimit(input.gasLimit)
			.payload(data.slice(2))
			.nonce(nonce)
			.gasPrice(parseUnits(input.gasPrice, "gwei").toNumber());

		return this.#buildTransaction(input, transaction);
	}

	/**
	 * @inheritDoc
	 */
	public override async multiPayment(input: Services.MultiPaymentInput): Promise<Contracts.SignedTransactionData> {
		applyCryptoConfiguration(this.#configCrypto);
		this.#assertGasFee(input);

		if (!input.data.payments) {
			throw new Error(
				`[TransactionService#multiPayment] Expected payments to be defined but received ${typeof input.data
					.payments}`,
			);
		}

		const transaction = this.#app.resolve(EvmCallBuilder);

		const { address } = await this.#signerData(input);
		const nonce = await this.#generateNonce(address, input);

		const recipients: string[] = [];
		const amounts: number[] = [];

		for (const payment of input.data.payments) {
			recipients.push(payment.to);
			amounts.push(parseUnits(payment.amount, "ark").toNumber());
		}

		const data = encodeFunctionData({
			abi: MultiPaymentAbi.abi,
			args: [recipients, amounts],
			functionName: "pay",
		});

		transaction
			.network(this.#configCrypto.crypto.network.chainId)
			.gasLimit(input.gasLimit)
			.recipientAddress(wellKnownContracts.multiPayment)
			.payload(data.slice(2))
			.nonce(nonce)
			.value(amounts.reduce((a, b) => a + b, 0).toString())
			.gasPrice(parseUnits(input.gasPrice, "gwei").toNumber());

		return this.#buildTransaction(input, transaction);
	}

	public override async usernameRegistration(
		input: Services.UsernameRegistrationInput,
	): Promise<Contracts.SignedTransactionData> {
		applyCryptoConfiguration(this.#configCrypto);
		this.#assertGasFee(input);

		if (!input.data.username) {
			throw new Error(
				`[TransactionService#validatorRegistration] Expected username to be defined but received ${typeof input
					.data.username}`,
			);
		}

		const transaction = this.#app.resolve(EvmCallBuilder);

		const { address } = await this.#signerData(input);
		const nonce = await this.#generateNonce(address, input);

		const data = encodeFunctionData({
			abi: UsernamesAbi.abi,
			args: [input.data.username],
			functionName: "registerUsername",
		});

		transaction
			.network(this.#configCrypto.crypto.network.chainId)
			.gasLimit(input.gasLimit)
			.recipientAddress(wellKnownContracts.username)
			.payload(data.slice(2))
			.nonce(nonce)
			.gasPrice(parseUnits(input.gasPrice, "gwei").toNumber());

		return this.#buildTransaction(input, transaction);
	}

	public override async usernameResignation(
		input: Services.UsernameResignationInput,
	): Promise<Contracts.SignedTransactionData> {
		applyCryptoConfiguration(this.#configCrypto);
		this.#assertGasFee(input);

		const transaction = this.#app.resolve(EvmCallBuilder);

		const { address } = await this.#signerData(input);
		const nonce = await this.#generateNonce(address, input);

		const data = encodeFunctionData({
			abi: UsernamesAbi.abi,
			args: [],
			functionName: "resignUsername",
		});

		transaction
			.network(this.#configCrypto.crypto.network.chainId)
			.gasLimit(input.gasLimit)
			.recipientAddress(wellKnownContracts.username)
			.payload(data.slice(2))
			.nonce(nonce)
			.gasPrice(parseUnits(input.gasPrice, "gwei").toNumber());

		return this.#buildTransaction(input, transaction);
	}

	public override async validatorResignation(
		input: Services.ValidatorResignationInput,
	): Promise<Contracts.SignedTransactionData> {
		applyCryptoConfiguration(this.#configCrypto);
		this.#assertGasFee(input);

		const transaction = this.#app.resolve(EvmCallBuilder);

		const { address } = await this.#signerData(input);
		const nonce = await this.#generateNonce(address, input);

		const data = encodeFunctionData({
			abi: ConsensusAbi.abi,
			args: [],
			functionName: "resignValidator",
		});

		transaction
			.network(this.#configCrypto.crypto.network.chainId)
			.gasLimit(input.gasLimit)
			.recipientAddress(wellKnownContracts.consensus)
			.payload(data.slice(2))
			.nonce(nonce)
			.gasPrice(parseUnits(input.gasPrice, "gwei").toNumber());

		return this.#buildTransaction(input, transaction);
	}

	public override async delegateResignation(
		input: Services.DelegateResignationInput,
	): Promise<Contracts.SignedTransactionData> {
		return this.validatorResignation(input);
	}

	public override async estimateExpiration(value?: string): Promise<string | undefined> {
		const { data: blockchain } = await this.#request.get("blockchain");
		const { data: configuration } = await this.#request.get("node/configuration");

		return BigNumber.make(blockchain.block.height)
			.plus((value ? Number(value) : 5) * configuration.constants.activeValidators)
			.toString();
	}

	async #signerData(input: Services.TransactionInputs): Promise<{ address?: string; publicKey?: string }> {
		let address: string | undefined;
		let publicKey: string | undefined;

		if (input.signatory.actsWithMnemonic() || input.signatory.actsWithConfirmationMnemonic()) {
			address = (await this.#addressService.fromMnemonic(input.signatory.signingKey())).address;
			publicKey = (await this.#publicKeyService.fromMnemonic(input.signatory.signingKey())).publicKey;
		}

		if (input.signatory.actsWithSecret() || input.signatory.actsWithConfirmationSecret()) {
			address = (await this.#addressService.fromSecret(input.signatory.signingKey())).address;
			publicKey = (await this.#publicKeyService.fromSecret(input.signatory.signingKey())).publicKey;
		}

		if (input.signatory.actsWithWIF() || input.signatory.actsWithConfirmationWIF()) {
			address = (await this.#addressService.fromWIF(input.signatory.signingKey())).address;
			publicKey = (await this.#publicKeyService.fromWIF(input.signatory.signingKey())).publicKey;
		}

		if (input.signatory.actsWithMultiSignature()) {
			address = (
				await this.#addressService.fromMultiSignature({
					min: input.signatory.asset().min,
					publicKeys: input.signatory.asset().publicKeys,
				})
			).address;
		}

		if (input.signatory.actsWithLedger()) {
			publicKey = await this.#ledgerService.getPublicKey(input.signatory.signingKey());
			const extendedPublicKey = await this.#ledgerService.getExtendedPublicKey(input.signatory.signingKey());
			address = (await this.#addressService.fromPublicKey(extendedPublicKey)).address;
		}

		return { address, publicKey };
	}

	async #generateNonce(address?: string, input?: Services.TransactionInputs): Promise<string> {
		if (input?.nonce) {
			return input.nonce;
		}

		const wallet = await this.clientService.wallet({ type: "address", value: address! });

		return wallet.nonce().toFixed(0);
	}

	async #buildTransaction(
		input: Services.TransactionInputs,
		transaction: any,
	): Promise<Contracts.SignedTransactionData> {
		let signedTransactionBuilder;

		if (input.signatory.actsWithMnemonic()) {
			signedTransactionBuilder = await transaction.sign(input.signatory.signingKey());
		}

		if (input.signatory.actsWithConfirmationMnemonic()) {
			signedTransactionBuilder = await transaction.sign(input.signatory.signingKey());
			// transaction.secondSign(input.signatory.confirmKey());
		}

		if (input.signatory.actsWithWIF()) {
			signedTransactionBuilder = await transaction.signWithWif(input.signatory.signingKey());
		}

		if (input.signatory.actsWithConfirmationWIF()) {
			signedTransactionBuilder = await transaction.signWithWif(input.signatory.signingKey());
			// transaction.secondSignWithWif(input.signatory.confirmKey());
		}

		if (input.signatory.actsWithSecret()) {
			signedTransactionBuilder = await transaction.sign(input.signatory.signingKey());
		}

		if (input.signatory.actsWithConfirmationSecret()) {
			signedTransactionBuilder = await transaction.sign(input.signatory.signingKey());
			// transaction.secondSign(input.signatory.confirmKey());
		}

		if (input.signatory.actsWithLedger()) {
			const senderPublicKey = await this.#ledgerService.getPublicKey(input.signatory.signingKey());
			const extendedPublicKey = await this.#ledgerService.getExtendedPublicKey(input.signatory.signingKey());
			const senderAddress = (await this.#addressService.fromPublicKey(extendedPublicKey)).address;

			const serialized = await this.#app.resolve(Utils).toBytes(transaction.data);
			const signature = await this.#ledgerService.sign(input.signatory.signingKey(), serialized.toString("hex"));

			transaction.data = {
				...transaction.data,
				...signature,
				senderAddress,
				senderPublicKey,
				v: parseInt(signature.v) + 27, // @TODO: remove it on mainsail evm.16
			};

			// Reassign public key to match the signer, as `build` changes it.
			const signedTransaction = await transaction?.build(transaction.data);
			signedTransaction.data.senderPublicKey = senderPublicKey;
			signedTransaction.data.senderAddress = senderAddress;

			return this.dataTransferObjectService.signedTransaction(signedTransaction.id!, signedTransaction.data);
		}

		const signedTransaction = await transaction?.build(transaction.data);

		return this.dataTransferObjectService.signedTransaction(signedTransaction.id!, signedTransaction.data);
	}
}

export { wellKnownContracts };
