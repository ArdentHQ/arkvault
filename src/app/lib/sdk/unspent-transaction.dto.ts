/* istanbul ignore file */

import { BigNumber } from "@/app/lib/helpers";

import { UnspentTransactionData as Contract } from "./confirmed-transaction.dto.contract";
import { KeyValuePair } from "./contracts";

export class UnspentTransactionData implements Contract {
	readonly #data: KeyValuePair;

	public constructor(data: KeyValuePair) {
		this.#data = data;
	}

	public hash(): string {
		return this.#data.hash;
	}

	public timestamp(): string {
		return this.#data.timestamp;
	}

	public value(): BigNumber {
		return this.#data.value;
	}

	public address(): string {
		return this.#data.address;
	}
}
