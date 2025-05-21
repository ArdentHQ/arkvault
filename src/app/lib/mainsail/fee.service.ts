/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */
import { Contracts, Services } from "@/app/lib/mainsail";
import { BigNumber } from "@/app/lib/helpers";

import { ArkClient } from "@arkecosystem/typescript-client";
import { ConfigRepository } from "@/app/lib/mainsail";
import { IProfile } from "@/app/lib/profiles/profile.contract";
import { UnitConverter } from "@arkecosystem/typescript-crypto";

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
		this.#client = new ArkClient(this.#config.host("full", profile));
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
}
