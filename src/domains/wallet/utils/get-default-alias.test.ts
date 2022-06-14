import { Contracts } from "@ardenthq/sdk-profiles";

import { getDefaultAlias } from "./get-default-alias";
import { env, MNEMONICS } from "@/utils/testing-library";

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
			coin: "ARK",
			mnemonic: MNEMONICS[0],
			network: "ark.devnet",
		});

		profile.wallets().push(wallet);

		const result = getDefaultAlias({
			network: wallet.network(),
			profile,
		});

		expect(result).toBe("ARK Devnet #1");
	});

	it("should not return alias that already exist", async () => {
		const wallet = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: MNEMONICS[0],
			network: "ark.devnet",
		});

		profile.wallets().push(wallet);

		wallet.mutator().alias("ARK Devnet #1");

		const result = getDefaultAlias({
			network: wallet.network(),
			profile,
		});

		expect(result).toBe("ARK Devnet #2");
	});
});
