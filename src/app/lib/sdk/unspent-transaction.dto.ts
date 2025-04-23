/* istanbul ignore file */

import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";

import { UnspentTransactionData as Contract } from "./confirmed-transaction.dto.contract";
import { KeyValuePair } from "./contracts";

export class UnspentTransactionData implements Contract {
	readonly #data: KeyValuePair;

	public constructor(data: KeyValuePair) {
		this.#data = data;
	}

	public id(): string {
		return this.#data.id;
	}

	public timestamp(): DateTime {
		return this.#data.timestamp;
	}

	public amount(): BigNumber {
		return this.#data.amount;
	}

	public address(): string {
		return this.#data.address;
	}
}
