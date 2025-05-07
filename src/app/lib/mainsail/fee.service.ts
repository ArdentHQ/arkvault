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

export class FeeService extends Services.AbstractFeeService {
	readonly #client: ArkClient;

	public constructor(container: IoC.IContainer) {
		super(container);

		const hostSelector = container.get<Networks.NetworkHostSelector>(IoC.BindingType.NetworkHostSelector);
		const host = hostSelector(container.get(IoC.BindingType.ConfigRepository));

		this.#client = new ArkClient(host.host);
	}

	public override async all(): Promise<Services.TransactionFees> {
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

	public override async calculate(
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
