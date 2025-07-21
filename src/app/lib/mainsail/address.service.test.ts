import { describe, it, expect, vi, beforeEach } from "vitest";
import { AddressService } from "./address.service";
import { MAINSAIL_MNEMONICS } from "@/utils/testing-library";

describe("AddressService", () => {
	let addressService: AddressService;

	beforeEach(() => {
		vi.clearAllMocks();
		addressService = new AddressService();
	});

	describe("fromMnemonic", () => {
		it("should return address from a valid mnemonic", () => {
			const result = addressService.fromMnemonic(MAINSAIL_MNEMONICS[0]);

			expect(result).toEqual({
				address: "0x659A76be283644AEc2003aa8ba26485047fd1BFB",
				type: "bip39",
			});
		});

		it("should throw an error for an invalid mnemonic", () => {
			const invalidMnemonic = "invalid mnemonic";
			expect(() => addressService.fromMnemonic(invalidMnemonic)).toThrow(
				"The given value is not BIP39 compliant.",
			);
		});
	});

	describe("fromPublicKey", () => {
		it("should return address from a public key", () => {
			const mockPublicKey = "0293b9fd80d472bbf678404d593705268cf09324115f73103bc1477a3933350041";

			const result = addressService.fromPublicKey(mockPublicKey);

			expect(result).toEqual({
				address: "0x47ea9bAa16edd859C1792933556c4659A647749C",
				type: "bip39",
			});
		});
	});

	describe("fromPrivateKey", () => {
		it("should return address from a private key", () => {
			const result = addressService.fromPrivateKey(
				"cbf4b9f70470856bb4f40f80b87edb90865997ffee6df315ab166d713af433a5",
			);

			expect(result).toEqual({
				address: "0x0DDBAeF36273c81e4fB9Fe48A36D68C45442c4e6",
				type: "bip39",
			});
		});
	});

	describe("fromSecret", () => {
		it("should return address from non-BIP39 secret", () => {
			const result = addressService.fromSecret("password");

			expect(result).toEqual({
				address: "0xfb35AD702E715E61A3F362C62DA7C1BD235102FC",
				type: "bip39",
			});
		});

		it("should throw an error if the secret is BIP39 compliant", () => {
			expect(() => addressService.fromSecret(MAINSAIL_MNEMONICS[0])).toThrow(
				"The given value is BIP39 compliant. Please use [fromMnemonic] instead.",
			);
		});
	});

	describe("validate", () => {
		it("should return true for a valid address", () => {
			expect(addressService.validate("0xfb35AD702E715E61A3F362C62DA7C1BD235102FC")).toBe(true);
		});

		it("should return false for an invalid address", () => {
			expect(addressService.validate("invalid")).toBe(false);
		});
	});
});
