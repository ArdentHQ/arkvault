import { describe, it, expect, beforeEach, vi } from "vitest";
import { WalletSerialiser } from "./serialiser";
import { env, getDefaultProfileId } from "@/utils/testing-library";
import { IReadWriteWallet } from "./wallet.contract";
import { WalletData } from "./contracts";

describe("WalletSerialiser", () => {
	let serialiser: WalletSerialiser;
	let wallet: IReadWriteWallet;

	beforeEach(() => {
		const profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();
		serialiser = new WalletSerialiser(wallet);
	});

	it("#toJSON", () => {
		const result = serialiser.toJSON();

		expect(result).toHaveProperty("id", wallet.id());
		expect(result).toHaveProperty("settings");
		expect(result).toHaveProperty("data");
		expect(result).toMatchInlineSnapshot(`
			{
			  "data": {
			    "ADDRESS": "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
			    "ADDRESS_INDEX": undefined,
			    "BALANCE": {
			      "available": "95276532523250678785",
			      "fees": "95276532523250678785",
			    },
			    "BROADCASTED_TRANSACTIONS": {},
			    "DERIVATION_PATH": undefined,
			    "DERIVATION_TYPE": undefined,
			    "ENCRYPTED_CONFIRM_KEY": undefined,
			    "ENCRYPTED_SIGNING_KEY": undefined,
			    "IMPORT_METHOD": "BIP39.MNEMONIC",
			    "IS_PRIMARY": false,
			    "LEDGER_MODEL": undefined,
			    "NETWORK": "mainsail.devnet",
			    "PUBLIC_KEY": "021adbf4453accaefea33687c672fd690702246ef397363421585f134a1e68c175",
			    "SEQUENCE": "8",
			    "SIGNED_TRANSACTIONS": {},
			    "STARRED": false,
			    "STATUS": undefined,
			    "TOKEN_COUNT": 0,
			    "VOTES": [],
			    "VOTES_AVAILABLE": 0,
			    "VOTES_USED": 0,
			  },
			  "id": "ee02b13f-8dbf-4191-a9dc-08d2ab72ec28",
			  "settings": {
			    "ALIAS": "Mainsail Wallet 1",
			    "AVATAR": "<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#EF7C6D"/></svg>",
			    "IS_SELECTED": true,
			  },
			}
		`);
	});

	it("should serialize balance with locked field", () => {
		const dataSpy = vi.spyOn(wallet.data(), "get").mockImplementation((key?: string) => {
			if (key === WalletData.Balance) {
				return {
					available: "1000",
					fees: "500",
					locked: "200",
				};
			}
			return;
		});

		const result = new WalletSerialiser(wallet).toJSON();
		expect(result.data.BALANCE.locked).toBe("200");

		dataSpy.mockRestore();
	});

	it("should serialize balance with lockedVotes field", () => {
		const dataSpy = vi.spyOn(wallet.data(), "get").mockImplementation((key?: string) => {
			if (key === WalletData.Balance) {
				return {
					available: "1000",
					fees: "500",
					lockedVotes: "300",
				};
			}
			return;
		});

		const result = new WalletSerialiser(wallet).toJSON();
		expect(result.data.BALANCE.lockedVotes).toBe("300");

		dataSpy.mockRestore();
	});

	it("should serialize balance with lockedUnvotes field", () => {
		const dataSpy = vi.spyOn(wallet.data(), "get").mockImplementation((key?: string) => {
			if (key === WalletData.Balance) {
				return {
					available: "1000",
					fees: "500",
					lockedUnvotes: "150",
				};
			}
			return;
		});

		const result = new WalletSerialiser(wallet).toJSON();
		expect(result.data.BALANCE.lockedUnvotes).toBe("150");

		dataSpy.mockRestore();
	});

	it("should default available and fees to 0 when undefined", () => {
		const dataSpy = vi.spyOn(wallet.data(), "get").mockImplementation((key?: string) => {
			if (key === WalletData.Balance) {
				return { available: undefined, fees: undefined };
			}
			return;
		});

		const result = new WalletSerialiser(wallet).toJSON();
		expect(result.data.BALANCE.available).toBe("0");
		expect(result.data.BALANCE.fees).toBe("0");

		dataSpy.mockRestore();
	});

	it("should serialize balance with tokens field", () => {
		const dataSpy = vi.spyOn(wallet.data(), "get").mockImplementation((key?: string) => {
			if (key === WalletData.Balance) {
				return {
					available: "1000",
					fees: "500",
					tokens: {
						"0xTokenA": "5000",
						"0xTokenB": "10000",
					},
				};
			}
			return;
		});

		const result = new WalletSerialiser(wallet).toJSON();
		expect(result.data.BALANCE.tokens).toEqual({
			"0xTokenA": "5000",
			"0xTokenB": "10000",
		});

		dataSpy.mockRestore();
	});
});
