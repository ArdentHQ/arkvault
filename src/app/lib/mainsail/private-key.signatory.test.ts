import { describe, it, expect } from "vitest";
import { PrivateKeySignatory } from "./private-key.signatory";

describe("PrivateKeySignatory", () => {
	it("should return the correct signing key", () => {
		const signatory = new PrivateKeySignatory({
			address: "WalletAddress",
			signingKey: "SecretSigningKey",
		});
		expect(signatory.signingKey()).toBe("SecretSigningKey");
	});

	it("should return the correct address", () => {
		const signatory = new PrivateKeySignatory({
			address: "WalletAddress",
			signingKey: "SecretSigningKey",
		});
		expect(signatory.address()).toBe("WalletAddress");
	});

	it("should return the private key (which is the signing key)", () => {
		const signatory = new PrivateKeySignatory({
			address: "anotherAddress",
			signingKey: "anotherSecretKey",
		});
		expect(signatory.privateKey()).toBe("anotherSecretKey");
	});

	it("should return undefined for options if not provided", () => {
		const signatory = new PrivateKeySignatory({
			address: "addressWithoutOptions",
			signingKey: "keyWithoutOptions",
		});
		expect(signatory.options()).toBeUndefined();
	});

	it("should return the correct options when provided", () => {
		const testOptions = { anotherOption: 123, someOption: "value" };
		const signatory = new PrivateKeySignatory({
			address: "addressWithOptions",
			options: testOptions,
			signingKey: "keyWithOptions",
		});
		expect(signatory.options()).toEqual(testOptions);
	});
});
