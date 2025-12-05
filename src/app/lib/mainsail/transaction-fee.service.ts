import { Networks } from "@/app/lib/mainsail";
import { IProfile } from "@/app/lib/profiles/profile.contract.js";
import { EncodeInputData, EncodeTransactionType, TransactionEncoder } from "./transaction-encoder";
import { BigNumber } from "@/app/lib/helpers";
import { Contracts, Environment } from "@/app/lib/profiles";
import { TransactionFee } from "./fee.contract";

interface Properties {
	type: EncodeTransactionType;
	data: Record<string, any> | undefined;
	network: Networks.Network;
	profile: Contracts.IProfile;
}

const gasLimit21k = BigNumber.make(21_000);
export const GasLimit: Record<Properties["type"], BigNumber> = {
	contractDeployment: BigNumber.make(2_000_000),
	multiPayment: gasLimit21k,
	multiSignature: gasLimit21k,
	transfer: gasLimit21k,
	// updateValidator uses `evmCall`
	updateValidator: BigNumber.make(200_000),
	usernameRegistration: BigNumber.make(200_000),
	usernameResignation: BigNumber.make(200_000),
	validatorRegistration: BigNumber.make(400_000),
	validatorResignation: BigNumber.make(150_000),
	vote: BigNumber.make(200_000),
};

const FEE_DISPLAY_VALUE_DECIMALS = 8;

export class TransactionFeeService {
	readonly #network: Networks.Network;
	readonly #env: Environment;
	readonly #profile: Contracts.IProfile;
	// readonly #gasLimit: BigNumber;
	// readonly #fees: TransactionFee;

	public constructor({ profile, network, env }: { profile: IProfile; network: Networks.Network; env: Environment }) {
		this.#env = env;
		this.#network = network;
		this.#profile = profile;
	}

	public async gasLimit(transactionData: EncodeInputData, type: EncodeTransactionType): Promise<BigNumber> {
		const gas = await this.#network.fees().estimateGas({
			from: transactionData.senderAddress,
			...new TransactionEncoder(this.#network).byType(transactionData, type),
		});

		if (!gas.isZero()) {
			// Add 20% buffer on the gas, in case the estimate is too low.
			// @see https://app.clickup.com/t/86dxe6nxx
			return gas.times(1.2).integerValue();
		}

		const isMultiPayment = type === "multiPayment";
		const fallbackGasLimit = isMultiPayment
			? GasLimit.multiPayment.times(transactionData.recipients?.length ?? 0)
			: GasLimit[type];
		return fallbackGasLimit;
	}
	public async calculateFees(transactionType: "transfer" | "updateValidator"): Promise<TransactionFee> {
		const type = transactionType === "updateValidator" ? "evmCall" : transactionType;
		await this.#env.fees().sync(this.#profile);
		return this.#env.fees().findByType(this.#network.id(), type);
	}
}
