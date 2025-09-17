import { Contracts } from "@/app/lib/profiles";

import { getDefaultAlias } from "./get-default-alias";
import { env, MAINSAIL_MNEMONICS } from "@/utils/testing-library";

describe("getDefaultAlias", () => {
	let profile: Contracts.IProfile;

	beforeEach(async () => {
		profile = await env.profiles().create("empty profile");

		await env.profiles().restore(profile);
	});

	afterEach(() => {
		env.profiles().forget(profile.id());
	});

	it("should return a default alias when wallet already exists", async () => {
		const wallet = await profile.walletFactory().fromMnemonicWithBIP39({
			mnemonic: MAINSAIL_MNEMONICS[0],
			network: "mainsail.devnet",
		});

		profile.wallets().push(wallet);

		const result = getDefaultAlias({
			profile,
		});

		expect(result).toBe("Address #1");
	});

	it("should not return alias that already exist", async () => {
		const wallet = await profile.walletFactory().fromMnemonicWithBIP39({
			mnemonic: MAINSAIL_MNEMONICS[0],
			network: "mainsail.devnet",
		});

		profile.wallets().push(wallet);

		wallet.mutator().alias("Address #1");

		const result = getDefaultAlias({
			profile,
		});

		expect(result).toBe("Address #2");
	});

	it("should increase the alias number regardless of the network", async () => {
		const wallet = await profile.walletFactory().fromMnemonicWithBIP39({
			mnemonic: MAINSAIL_MNEMONICS[0],
			network: "mainsail.devnet",
		});

		profile.wallets().push(wallet);

		const result = getDefaultAlias({
			profile,
		});

		expect(result).toBe("Address #1");

		const wallet2 = await profile.walletFactory().fromMnemonicWithBIP39({
			mnemonic: MAINSAIL_MNEMONICS[1],
			network: "mainsail.mainnet",
		});

		profile.wallets().push(wallet2);

		const result2 = getDefaultAlias({
			profile,
		});

		expect(result2).toBe("Address #2");
	});

	it("should use addressIndex to generate alias", async () => {
		const wallet = await profile.walletFactory().fromMnemonicWithBIP39({
			mnemonic: MAINSAIL_MNEMONICS[0],
		});

		profile.wallets().push(wallet);

		const result = getDefaultAlias({
			addressIndex: 0,
			profile,
		});

		wallet.mutator().alias("Address #1");
		expect(result).toBe("Address #1");

		const wallet2 = await profile.walletFactory().fromMnemonicWithBIP39({
			mnemonic: MAINSAIL_MNEMONICS[1],
		});

		profile.wallets().push(wallet2);

		const result2 = getDefaultAlias({
			addressIndex: 1,
			profile,
		});

		expect(result2).toBe("Address #2");
	});
});
