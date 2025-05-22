/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */
import { ConfigRepository, Contracts, Services } from "@/app/lib/mainsail";
import { BigNumber } from "@/app/lib/helpers";

import { formatUnits } from "./helpers/format-units";
import { ArkClient } from "@arkecosystem/typescript-client";
import { IProfile } from "@/app/lib/profiles/profile.contract";
import { EstimateGasPayload } from "@/app/lib/mainsail/fee.contract";

interface Fees {
	min: string;
	avg: string;
	max: string;
}

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
		return await this.#client.evm().ethCall({
			id: "1",
			method: "eth_estimateGas",
			params: [payload],
		});
	}

	public async calculate(
		transaction: Contracts.RawTransactionData,
		options?: Services.TransactionFeeOptions,
	): Promise<BigNumber> {
		return BigNumber.ZERO;
	}

	#transform(fees: Fees): Services.TransactionFee {
		return {
			avg: formatUnits(fees.avg ?? "0", "gwei"),
			max: formatUnits(fees.max ?? "0", "gwei"),
			min: formatUnits(fees.min ?? "0", "gwei"),
		};
	}
}
