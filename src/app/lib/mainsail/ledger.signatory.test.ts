import { describe, it, expect } from "vitest";
import { LedgerSignatory } from "./ledger.signatory";
import { IdentityOptions } from "./shared.contract";

describe("LedgerSignatory", () => {
	it("should create instance with signingKey", () => {
		const signingKey = "m/44'/60'/0'/0/0";
		const signatory = new LedgerSignatory({ signingKey });

		expect(signatory).toBeInstanceOf(LedgerSignatory);
		expect(signatory.signingKey()).toBe(signingKey);
		expect(signatory.options()).toBeUndefined();
	});

	it("should create instance with signingKey and options", () => {
		const signingKey = "m/44'/60'/0'/0/0";
		const options: IdentityOptions = {
			bip44: { account: 0, addressIndex: 0, change: 0 },
		};
		const signatory = new LedgerSignatory({ options, signingKey });

		expect(signatory).toBeInstanceOf(LedgerSignatory);
		expect(signatory.signingKey()).toBe(signingKey);
		expect(signatory.options()).toBe(options);
	});

	it("should return signingKey correctly", () => {
		const signingKey = "m/44'/60'/0'/0/1";
		const signatory = new LedgerSignatory({ signingKey });

		expect(signatory.signingKey()).toBe(signingKey);
	});

	it("should return options correctly", () => {
		const signingKey = "m/44'/60'/0'/0/0";
		const options: IdentityOptions = {
			bip44: { account: 1, addressIndex: 5, change: 0 },
		};
		const signatory = new LedgerSignatory({ options, signingKey });

		expect(signatory.options()).toBe(options);
		expect(signatory.options()?.bip44?.account).toBe(1);
		expect(signatory.options()?.bip44?.addressIndex).toBe(5);
	});

	it("should return undefined options when not provided", () => {
		const signingKey = "m/44'/60'/0'/0/0";
		const signatory = new LedgerSignatory({ signingKey });

		expect(signatory.options()).toBeUndefined();
	});
});
