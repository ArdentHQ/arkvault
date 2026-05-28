import {
	findBip39WalletAddress,
	findSecretWalletAddress,
	validatePublicKeyAddress,
	validatePublicKeyDuplicate,
} from "./ImportDetailStep";
import { AddressService } from "@/app/lib/mainsail/address.service";
import { Contracts } from "@/app/lib/profiles";
import { TFunction } from "i18next";

const t = ((key: string) => key) as unknown as TFunction;

const makeProfile = (overrides: object) => overrides as unknown as Contracts.IProfile;

describe("validatePublicKeyDuplicate", () => {
	it("should return error when findByPublicKey throws", () => {
		const profile = makeProfile({
			wallets: () => ({
				findByPublicKey: () => {
					throw new Error("not found");
				},
			}),
		});

		const result = validatePublicKeyDuplicate({ profile, t, value: "invalid-key" });

		expect(result).toBe("WALLETS.PAGE_IMPORT_WALLET.VALIDATION.INVALID_PUBLIC_KEY");
	});
});

describe("validatePublicKeyAddress", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should return error when address is invalid", async () => {
		const mockWallet = { address: () => "0xabc" };
		const profile = makeProfile({
			walletFactory: () => ({ fromPublicKey: async () => mockWallet }),
		});

		vi.spyOn(AddressService.prototype, "validate").mockReturnValue(false);

		const result = await validatePublicKeyAddress({ profile, publicKey: "some-key", t });

		expect(result).toBe("WALLETS.PAGE_IMPORT_WALLET.VALIDATION.INVALID_PUBLIC_KEY");
	});
});

describe("findBip39WalletAddress", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should throw INVALID_MNEMONIC when address is invalid", async () => {
		const mockWallet = { address: () => "0xabc" };
		const profile = makeProfile({
			walletFactory: () => ({ fromMnemonicWithBIP39: async () => mockWallet }),
		});

		vi.spyOn(AddressService.prototype, "validate").mockReturnValue(false);

		await expect(findBip39WalletAddress({ mnemonic: "test mnemonic", profile, t })).rejects.toThrow(
			"WALLETS.PAGE_IMPORT_WALLET.VALIDATION.INVALID_MNEMONIC",
		);
	});
});

describe("findSecretWalletAddress", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should throw INVALID_SECRET when address is invalid", async () => {
		const mockWallet = { address: () => "0xabc" };
		const profile = makeProfile({
			walletFactory: () => ({ fromSecret: async () => mockWallet }),
		});

		vi.spyOn(AddressService.prototype, "validate").mockReturnValue(false);

		await expect(findSecretWalletAddress({ profile, secret: "my-secret", t })).rejects.toThrow(
			"WALLETS.PAGE_IMPORT_WALLET.VALIDATION.INVALID_SECRET",
		);
	});

	it("should throw INVALID_SECRET when fromSecret throws a BIP39 error", async () => {
		const profile = makeProfile({
			walletFactory: () => ({
				fromSecret: async () => {
					throw new Error("The given value is BIP39 compliant.");
				},
			}),
		});

		await expect(findSecretWalletAddress({ profile, secret: "bip39-secret", t })).rejects.toThrow(
			"WALLETS.PAGE_IMPORT_WALLET.VALIDATION.INVALID_SECRET",
		);
	});
});
