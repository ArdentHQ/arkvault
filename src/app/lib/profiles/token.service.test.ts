import { describe, it, expect, beforeAll, afterAll } from "vitest";

import { TokenDTO } from "./token.dto";
import Fixtures from "@/tests/fixtures/coins/mainsail/devnet/tokens.json";
import { Contracts } from ".";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { WalletTokenRepository } from "./wallet-token.repository";
import { WalletTokenDTO } from "./wallet-token.dto";
import { WalletToken } from "./wallet-token";
import { WalletTokenCollection } from "@/app/lib/mainsail/wallet-token.collection";

describe("TokenService", () => {
	let profile: Contracts.IProfile;
	let walletTokenDTO: WalletTokenDTO;
	let tokenDTO: TokenDTO;
	let walletToken: WalletToken;

	const fixtureData = Fixtures.ByContractAddress.data;
	const walletTokenData = Fixtures.ByWalletAddress.data[0];

	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		await env.profiles().restore(profile);

		walletTokenDTO = new WalletTokenDTO(walletTokenData);
		tokenDTO = new TokenDTO(fixtureData);
		walletToken = new WalletToken({
			network: profile.activeNetwork(),
			profile,
			token: tokenDTO,
			walletToken: walletTokenDTO,
		});

		const repository = new WalletTokenRepository(profile.activeNetwork(), profile);
		repository.push(walletToken);

		vi.spyOn(profile.wallets().first(), "tokens").mockReturnValue(repository);
	});
	afterAll(() => {
		vi.restoreAllMocks();
	});

	it("should return first token", async () => {
		await profile.tokens().sync();
		const tokens = profile.tokens().selected()

		expect(tokens).toBeInstanceOf(WalletTokenCollection);
		expect(tokens.items()[0]).toBeInstanceOf(WalletToken);
	});

	it("should remove dust balance tokens", async () => {
		await profile.tokens().sync();
		const tokens = profile.tokens().selected()

		vi.spyOn(profile.settings(), "get").mockReturnValue(true);
		vi.spyOn(tokens.items()[0], "balance").mockReturnValue(0.1);

		expect(tokens).toBeInstanceOf(WalletTokenCollection);
		expect(tokens.items()[1]).toBeUndefined();
	});
});
