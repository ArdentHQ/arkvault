import { describe, it, expect } from "vitest";
import { PublicKeyService } from "./public-key.service";
import { Exceptions } from "@/app/lib/mainsail";
import { MAINSAIL_MNEMONICS } from "@/utils/testing-library";

describe("PublicKeyService", () => {
	it("should return public key from a valid BIP39 mnemonic", () => {
		const mnemonic =
			"abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
		const service = new PublicKeyService();
		const result = service.fromMnemonic(mnemonic);
		expect(typeof result.publicKey).toBe("string");
		expect(result.publicKey.length).toBeGreaterThan(0);
	});

	it("should throw an error if fromMnemonic is a non-BIP39", () => {
		const invalidMnemonic = "invalid mnemonic";
		const service = new PublicKeyService();
		expect(() => service.fromMnemonic(invalidMnemonic)).toThrow("The given value is not BIP39 compliant.");
	});

	it("should return public key from a secret (non-BIP39)", () => {
		const secret = "a_strong_secret_password_123";
		const service = new PublicKeyService();
		const result = service.fromSecret(secret);
		expect(typeof result.publicKey).toBe("string");
		expect(result.publicKey.length).toBeGreaterThan(0);
	});

	it("should throw an error if fromSecret receives a BIP39 compliant string", () => {
		const service = new PublicKeyService();
		expect(() => service.fromSecret(MAINSAIL_MNEMONICS[0])).toThrow(
			"The given value is BIP39 compliant. Please use [fromMnemonic] instead.",
		);
	});

	it("should throw NotImplemented exception for fromWIF", async () => {
		const service = new PublicKeyService();
		await expect(() => service.fromWIF("someWIFString")).toThrow(Exceptions.NotImplemented);
	});

	it("should fail to verify public key with BLS", () => {
		const invalidBlsPublicKey = "not a valid bls public key";
		const service = new PublicKeyService();
		expect(service.verifyPublicKeyWithBLS(invalidBlsPublicKey)).toBe(false);
	});
});
