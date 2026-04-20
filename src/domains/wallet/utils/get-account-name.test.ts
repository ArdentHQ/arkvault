import { describe, it, expect, beforeEach } from "vitest";
import { getAccountName } from "./get-account-name";
import { Contracts } from "@/app/lib/profiles";
import { env, getDefaultMainsailWalletMnemonic, getMainsailProfileId } from "@/utils/testing-library";
import { BIP44CoinType } from "@/app/lib/profiles/wallet.factory.contract";

const mnemonic = getDefaultMainsailWalletMnemonic();

describe("getAccountName", () => {
	let profile: Contracts.IProfile;

	const createWallet = async (addressIndex: number = 0) =>
		profile.walletFactory().fromMnemonicWithBIP44({
			coin: BIP44CoinType.ARK,
			levels: { account: 0, addressIndex, change: 0 },
			mnemonic,
		});

	const addWalletWithAccountName = async (name: string, addressIndex: number = 0) => {
		const wallet = await createWallet(addressIndex);
		wallet.mutator().accountName(name);
		profile.wallets().push(wallet);
		return wallet;
	};

	beforeEach(() => {
		profile = env.profiles().findById(getMainsailProfileId());

		// Clear all existing wallets to start with clean state
		for (const wallet of profile.wallets().values()) {
			profile.wallets().forget(wallet.id());
		}
	});

	it("should return 'HD 1' when no wallets exist", () => {
		const result = getAccountName({ profile });

		expect(result).toBe("HD 1");
	});

	it("should return 'HD 1' when no wallets have account names", async () => {
		// Create wallets without setting account names
		const wallet1 = await createWallet(0);
		const wallet2 = await createWallet(1);

		profile.wallets().push(wallet1);
		profile.wallets().push(wallet2);

		const result = getAccountName({ profile });

		expect(result).toBe("HD 1");
	});

	it("should return 'HD 2' when 'HD 1' already exists", async () => {
		await addWalletWithAccountName("HD 1");

		const result = getAccountName({ profile });

		expect(result).toBe("HD 2");
	});

	it("should handle non-HD account names correctly", async () => {
		await addWalletWithAccountName("Custom Wallet", 0);
		await addWalletWithAccountName("Another Name", 1);
		await addWalletWithAccountName("HD 1", 2);

		const result = getAccountName({ profile });

		expect(result).toBe("HD 2");
	});

	it("should find the first available number in a large sequence", async () => {
		// Create wallets with HD 1, 2, 3, 5, 6, 7 (missing HD 4)
		const accountNames = ["HD 1", "HD 2", "HD 3", "HD 5", "HD 6", "HD 7"];

		for (let index = 0; index < accountNames.length; index++) {
			await addWalletWithAccountName(accountNames[index], index);
		}

		const result = getAccountName({ profile });

		expect(result).toBe("HD 4");
	});
});
