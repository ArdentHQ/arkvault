/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */
import { Contracts, IoC, Networks, Services } from "@/app/lib/sdk";
import { BigNumber } from "@/app/lib/helpers";

import { formatUnits } from "./helpers/format-units";
import { ArkClient } from "@arkecosystem/typescript-client";

interface Fees {
	min: string;
	avg: string;
	max: string;
}

export class FeeService {
	readonly #client: ArkClient;

	public constructor() {
		const api = "https://dwallets-evm.mainsailhq.com/api"
		this.#client = new ArkClient(api);
	}

	public async all(): Promise<Services.TransactionFees> {
		const node = await this.#client.node().fees();
		const dynamicFees: Fees = node.data.evmCall;
		const fees = this.#transform(dynamicFees);

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

	public async calculate(
		transaction: Contracts.RawTransactionData,
		options?: Services.TransactionFeeOptions,
	): Promise<BigNumber> {
		return BigNumber.ZERO;
	}

	#transform(dynamicFees: Fees): Services.TransactionFee {
		return {
			avg: formatUnits(dynamicFees.avg ?? "0", "gwei"),
			isDynamic: true,
			max: formatUnits(dynamicFees.max ?? "0", "gwei"),
			min: formatUnits(dynamicFees.min ?? "0", "gwei"),
			static: BigNumber.make("0"),
		};
	}
}
