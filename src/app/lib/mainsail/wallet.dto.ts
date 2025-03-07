import { Contracts, DTO } from "@ardenthq/sdk";
import { BigNumber, get, has } from "@ardenthq/sdk-helpers";

export class WalletData extends DTO.AbstractWalletData implements Contracts.WalletData {
	public override primaryKey(): string {
		return this.address();
	}

	public override address(): string {
		return this.data.address;
	}

	public override publicKey(): string | undefined {
		return this.data.publicKey;
	}

	public override balance(): Contracts.WalletBalance {
		return {
			available: this.bigNumberService.make(this.data.balance ?? 0),
			fees: this.bigNumberService.make(this.data.balance ?? 0),
			total: this.bigNumberService.make(this.data.balance ?? 0),
		};
	}

	public override nonce(): BigNumber {
		return BigNumber.make(this.data.nonce ?? 0);
	}

	public override secondPublicKey(): string | undefined {
		return this.#getProperty(["secondPublicKey", "attributes.secondPublicKey"]);
	}

	public override username(): string | undefined {
		return this.#getProperty(["username", "attributes.username"]);
	}

	public override validatorPublicKey(): string | undefined {
		return this.#getProperty(["attributes.validatorPublicKey"]);
	}

	public override rank(): number | undefined {
		return this.#getProperty(["rank", "attributes.validatorRank"]);
	}

	public override votes(): BigNumber | undefined {
		const balance: string | undefined = this.#getProperty(["votes", "attributes.validatorVoteBalance"]);

		if (balance === undefined) {
			return undefined;
		}

		return BigNumber.make(balance);
	}

	public override multiSignature(): Contracts.WalletMultiSignature {
		if (!this.isMultiSignature()) {
			throw new Error("This wallet does not have a multi-signature registered.");
		}

		return this.#getProperty(["multiSignature", "attributes.multiSignature"]) as Contracts.WalletMultiSignature;
	}

	public override isDelegate(): boolean {
		return this.isValidator();
	}

	public override isResignedDelegate(): boolean {
		return this.isResignedValidator();
	}

	public override isValidator(): boolean {
		if (this.isResignedValidator()) {
			return false;
		}

		return !!this.#getProperty(["attributes.validatorPublicKey"]);
	}

	public override isResignedValidator(): boolean {
		return !!this.#getProperty(["attributes.validatorResigned"]);
	}

	public override isMultiSignature(): boolean {
		return !!this.#getProperty(["multiSignature", "attributes.multiSignature"]);
	}

	#getProperty<T>(keys: string[]): T | undefined {
		for (const key of keys) {
			if (has(this.data, key)) {
				return get(this.data, key);
			}
		}

		return undefined;
	}
}
