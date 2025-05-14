/* istanbul ignore file */

import { BigNumber } from "@/app/lib/helpers";

import { KeyValuePair, WalletBalance } from "./contracts";
import { NotImplemented } from "./exceptions";

export class AbstractWalletData {
	// Wallet
	public primaryKey(): string {
		throw new NotImplemented(this.constructor.name, this.primaryKey.name);
	}

	public address(): string {
		throw new NotImplemented(this.constructor.name, this.address.name);
	}

	public publicKey(): string | undefined {
		return undefined;
	}

	public balance(): WalletBalance {
		throw new NotImplemented(this.constructor.name, this.balance.name);
	}

	public nonce(): BigNumber {
		return BigNumber.ZERO;
	}

	// Second Signature
	public secondPublicKey(): string | undefined {
		return undefined;
	}

	// Delegate
	public username(): string | undefined {
		return undefined;
	}

	public validatorPublicKey(): string | undefined {
		return undefined;
	}

	public rank(): number | undefined {
		return undefined;
	}

	public votes(): BigNumber | undefined {
		return undefined;
	}

	// Flags
	public isDelegate(): boolean {
		return false;
	}

	public isResignedDelegate(): boolean {
		return false;
	}

	public isValidator(): boolean {
		return false;
	}

	public isResignedValidator(): boolean {
		return false;
	}

	public isSecondSignature(): boolean {
		return false;
	}

	public toObject(): KeyValuePair {
		return {
			address: this.address(),
			balance: this.balance(),
			isResignedValidator: this.isResignedValidator(),
			isSecondSignature: this.isSecondSignature(),
			isValidator: this.isValidator(),
			nonce: this.nonce(),
			publicKey: this.publicKey(),
			rank: this.rank(),
			username: this.username(),
			votes: this.votes(),
		};
	}
}
