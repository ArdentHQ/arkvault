import { describe, it, expect, vi, beforeEach } from "vitest";
import { MAINSAIL_MNEMONICS } from "@/utils/testing-library";
import { LegacyAddressService } from "./legacy-address.service";

describe("LegacyAddressService", () => {
	let legacyAddressService: LegacyAddressService;
	const pubKeyHash = 30;

	beforeEach(() => {
		vi.clearAllMocks();
		legacyAddressService = new LegacyAddressService();
	});

	describe("fromMnemonic", () => {
		it("should return address from a valid mnemonic", () => {
			const result = legacyAddressService.fromMnemonic(MAINSAIL_MNEMONICS[0], pubKeyHash);

			expect(result).toEqual({
				address: "DCj2GUcf6PMXP6rfzzYRvpbvrgbSWiCxWn",
				type: "bip39",
			});
		});

		it("should throw an error for an invalid mnemonic", () => {
			const invalidMnemonic = "invalid mnemonic";
			expect(() => legacyAddressService.fromMnemonic(invalidMnemonic, pubKeyHash)).toThrow(
				"The given value is not BIP39 compliant.",
			);
		});
	});

	describe("fromPublicKey", () => {
		it("should return address from a public key", () => {
			const mockPublicKey = "0293b9fd80d472bbf678404d593705268cf09324115f73103bc1477a3933350041";

			const result = legacyAddressService.fromPublicKey(mockPublicKey, pubKeyHash);

			expect(result).toEqual({
				address: "D6JhTeRB4vqMYrebvQSvLkLL89jm9psCEw",
				type: "bip39",
			});
		});
	});

	describe("fromPrivateKey", () => {
		it("should return address from a private key", () => {
			const result = legacyAddressService.fromPrivateKey(
				"cbf4b9f70470856bb4f40f80b87edb90865997ffee6df315ab166d713af433a5",
				pubKeyHash
			);

			expect(result).toEqual({
				address: "DHHKG4m4TTWkdCzT7NTwAZXumiTpjUaScG",
				type: "bip39",
			});
		});
	});

	describe("fromSecret", () => {
		it("should return address from non-BIP39 secret", () => {
			const result = legacyAddressService.fromSecret("password", pubKeyHash);

			expect(result).toEqual({
				address: "DABUYFmR6xkRdXC6ZQsyiPoP2PtjZVurfT",
				type: "bip39",
			});
		});

		it("should throw an error if the secret is BIP39 compliant", () => {
			expect(() => legacyAddressService.fromSecret(MAINSAIL_MNEMONICS[0], pubKeyHash)).toThrow(
				"The given value is BIP39 compliant. Please use [fromMnemonic] instead.",
			);
		});
	});

	describe("validate", () => {
		it("should return true for a valid address", () => {
			expect(legacyAddressService.validate("D7HWFT9hrooewSJUff1YcHL91MxHvDWmFZ", pubKeyHash)).toBe(true);
		});

		it("should return false for an invalid address", () => {
			expect(legacyAddressService.validate("invalid", pubKeyHash)).toBe(false);
		});
	});
});
