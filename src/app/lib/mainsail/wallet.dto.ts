import { Contracts } from "@/app/lib/mainsail";
import { BigNumber, get, has } from "@/app/lib/helpers";
import { KeyValuePair } from "@/app/lib/mainsail/contracts";
import { ConfigKey, ConfigRepository } from "@/app/lib/mainsail";

export class WalletData {
	protected data!: KeyValuePair;
	#config: ConfigRepository;

	constructor({ config }: { config: ConfigRepository }) {
		this.#config = config;
	}

	public fill(data: KeyValuePair) {
		this.data = data;

		return this;
	}

	public primaryKey(): string {
		return this.address();
	}

	public address(): string {
		return this.data.address;
	}

	public isSelected(): boolean {
		return this.data.isSelected === true;
	}

	public publicKey(): string | undefined {
		return this.data.publicKey;
	}

	public balance(): Contracts.WalletBalance {
		return {
			available: BigNumber.make(this.data.balance ?? 0, this.#config.get(ConfigKey.CurrencyDecimals)),
			fees: BigNumber.make(this.data.balance ?? 0, this.#config.get(ConfigKey.CurrencyDecimals)),
			total: BigNumber.make(this.data.balance ?? 0, this.#config.get(ConfigKey.CurrencyDecimals)),
		};
	}

	public nonce(): BigNumber {
		return BigNumber.make(this.data.nonce ?? 0);
	}

	public secondPublicKey(): string | undefined {
		return this.#getProperty(["secondPublicKey", "attributes.secondPublicKey"]);
	}

	public username(): string | undefined {
		return this.#getProperty(["username", "attributes.username"]);
	}

	public validatorPublicKey(): string | undefined {
		return this.#getProperty(["attributes.validatorPublicKey"]);
	}

	public rank(): number | undefined {
		return this.#getProperty(["rank", "attributes.validatorRank"]);
	}

	public votes(): BigNumber | undefined {
		const balance: string | undefined = this.#getProperty(["votes", "attributes.validatorVoteBalance"]);

		if (balance === undefined) {
			return undefined;
		}

		return BigNumber.make(balance);
	}

	public isResignedDelegate(): boolean {
		return this.isResignedValidator();
	}

	public isValidator(): boolean {
		if (this.isResignedValidator()) {
			return false;
		}

		return this.#getProperty(["attributes.validatorPublicKey"]) !== undefined;
	}

	public validatorFee(): number | undefined {
		return this.#getProperty(["attributes.validatorFee"]);
	}

	public isResignedValidator(): boolean {
		return !!this.#getProperty(["attributes.validatorResigned"]);
	}

	public isSecondSignature(): boolean {
		return !!this.#getProperty(["secondPublicKey", "attributes.secondPublicKey"]);
	}

	#getProperty<T>(keys: string[]): T | undefined {
		for (const key of keys) {
			if (has(this.data, key)) {
				return get(this.data, key);
			}
		}

		return undefined;
	}

	public toObject(): KeyValuePair {
		return {
			address: this.address(),
			balance: this.balance(),
			isResignedDelegate: this.isResignedDelegate(),
			isResignedValidator: this.isResignedValidator(),
			isSecondSignature: this.isSecondSignature(),
			isSelected: this.isSelected(),
			isValidator: this.isValidator(),
			nonce: this.nonce(),
			publicKey: this.publicKey(),
			rank: this.rank(),
			username: this.username(),
			votes: this.votes(),
		};
	}

	public toHuman(): KeyValuePair {
		const { available, fees, locked, tokens } = this.balance();

		const balance: {
			available: number;
			fees: number;
			locked?: number | undefined;
			tokens?: Record<string, number> | undefined;
		} = {
			available: available.toHuman(),
			fees: fees.toHuman(),
			locked: undefined,
			tokens: undefined,
		};

		if (locked) {
			balance.locked = locked.toHuman();
		}

		if (tokens) {
			balance.tokens = {};

			for (const [key, value] of Object.entries(tokens)) {
				balance.tokens[key] = value.toHuman();
			}
		}

		return {
			...this.toObject(),
			balance,
		};
	}

	public raw(): KeyValuePair {
		return this.data;
	}

	public hasPassed(): boolean {
		return Object.keys(this.data).length > 0;
	}

	public hasFailed(): boolean {
		return !this.hasPassed();
	}
}
