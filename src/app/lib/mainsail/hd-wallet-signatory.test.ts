import { describe, it, expect } from "vitest";
import { HDWalletSignatory } from "./hd-wallet.signatory";

const signingKey = "signing-key";

describe("HDWalletSignatory", () => {
	it("should create instance with signingKey and path", () => {
		const path = "m/44'/111'/0'/0/0";
		const signatory = new HDWalletSignatory({ path, signingKey });

		expect(signatory).toBeInstanceOf(HDWalletSignatory);
		expect(signatory.signingKey()).toBe(signingKey);
		expect(signatory.path()).toBe(path);
	});

	it("should return signingKey correctly", () => {
		const path = "m/44'/111'/0'/0/1";
		const signatory = new HDWalletSignatory({ path, signingKey });

		expect(signatory.signingKey()).toBe(signingKey);
	});

	it("should return path correctly", () => {
		const path = "m/44'/60'/0'/0/0";
		const signatory = new HDWalletSignatory({ path, signingKey });

		expect(signatory.path()).toBe(path);
	});
});
