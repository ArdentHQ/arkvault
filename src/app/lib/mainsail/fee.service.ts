/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */
import { ConfigRepository, Contracts, Services } from "@/app/lib/mainsail";
import { BigNumber } from "@/app/lib/helpers";

import { ArkClient } from "@arkecosystem/typescript-client";
import { IProfile } from "@/app/lib/profiles/profile.contract";
import { EstimateGasPayload, TransactionFee } from "@/app/lib/mainsail/fee.contract";
import { hexToBigInt } from "viem";
import { UnitConverter } from "@arkecosystem/typescript-crypto";

interface Fees {
	min: string;
	avg: string;
	max: string;
}

type ConfirmationFeeType = "Slow" | "Average" | "Fast";

const defaultBlockTime = 8000;

export class FeeService {
	readonly #client: ArkClient;
	#config: ConfigRepository;

	constructor({ config, profile }: { config: ConfigRepository; profile: IProfile }) {
		this.#config = config;
		const api = this.#config.host("full", profile);
		const evm = this.#config.host("evm", profile);
		this.#client = new ArkClient({ api, evm });
	}

	public async all(): Promise<Services.TransactionFees> {
		const node = await this.#client.node().fees();

		const fees = this.#transform(node.data.evmCall);

		return {
			evmCall: fees,
			validatorRegistration: fees,
			validatorResignation: fees,
			multiPayment: fees,
			secondSignature: fees,
			transfer: fees,
			usernameRegistration: fees,
			usernameResignation: fees,
			vote: fees,
		};
	}

	public async estimateGas(payload: EstimateGasPayload) {
		const gasResponse = await this.#client.evm().call({
			id: "1",
			method: "eth_estimateGas",
			params: [payload],
		});

		return BigNumber.make(hexToBigInt(gasResponse.result ?? 0));
	}

	public async calculate(
		transaction: Contracts.RawTransactionData,
		options?: Services.TransactionFeeOptions,
	): Promise<BigNumber> {
		return BigNumber.ZERO;
	}

	#transform(fees: Fees): Services.TransactionFee {
		return {
			avg: BigNumber.make(UnitConverter.formatUnits(fees.avg ?? "0", "gwei")),
			max: BigNumber.make(UnitConverter.formatUnits(fees.max ?? "0", "gwei")),
			min: BigNumber.make(UnitConverter.formatUnits(fees.min ?? "0", "gwei")),
		};
	}

	confirmationTime(feeType: keyof TransactionFee | undefined, blockTime?: number): number {
		const blockTimeInSeconds = BigNumber.make(blockTime ?? defaultBlockTime).divide(1000);

		const confirmationTimes: Record<ConfirmationFeeType, number> = {
			Average: blockTimeInSeconds.toNumber(),
			Fast: blockTimeInSeconds.toNumber(),
			Slow: blockTimeInSeconds.times(2).toNumber(),
		};

		if (!feeType) {
			return confirmationTimes["Average"];
		}

		return confirmationTimes[feeType] ?? confirmationTimes["Average"];
	}
}
