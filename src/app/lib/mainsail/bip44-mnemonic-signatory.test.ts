import { describe, it, expect } from "vitest";
import { Bip44MnemonicSignatory } from "./bip44-mnemonic.signatory";

const signingKey = "signing-key";

describe("BIP 44 Mnemonic Signatory", () => {
	it("should create instance with signingKey and path", () => {
		const path = "m/44'/111'/0'/0/0";
		const signatory = new Bip44MnemonicSignatory({ path, signingKey });

		expect(signatory).toBeInstanceOf(Bip44MnemonicSignatory);
		expect(signatory.signingKey()).toBe(signingKey);
		expect(signatory.path()).toBe(path);
	});

	it("should return signingKey correctly", () => {
		const path = "m/44'/111'/0'/0/1";
		const signatory = new Bip44MnemonicSignatory({ path, signingKey });

		expect(signatory.signingKey()).toBe(signingKey);
	});

	it("should return path correctly", () => {
		const path = "m/44'/60'/0'/0/0";
		const signatory = new Bip44MnemonicSignatory({ path, signingKey });

		expect(signatory.path()).toBe(path);
	});
});
