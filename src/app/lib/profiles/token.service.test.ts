import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { http, HttpResponse } from "msw";

import { TokenDTO } from "./token.dto";
import Fixtures from "@/tests/fixtures/coins/mainsail/devnet/tokens.json";
import { Contracts } from ".";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { WalletTokenRepository } from "./wallet-token.repository";
import { WalletTokenDTO } from "./wallet-token.dto";
import { WalletToken } from "./wallet-token";
import { WalletTokenCollection } from "@/app/lib/mainsail/wallet-token.collection";
import { ExtendedConfirmedTransactionDataCollection } from "@/app/lib/profiles/transaction.collection";
import { server } from "@/tests/mocks/server";
import { BigNumber } from "@/app/lib/helpers";

const createTransferData = (from: string) => ({
	blockNumber: "22773025",
	from,
	functionSig: "0xa9059cbb",
	timestamp: "1769010139522",
	to: "0xE3c31e486ccA6Eb2093c0F4883Df949d45B021C5",
	token: {
		address: "0x180a864a755fed0144c622df49b83db577befefb",
		decimals: 18,
		name: "DARK20",
		symbol: "DARK20",
	},
	transactionHash: "bf060a019f9f5a036f571e2b5bc0227c6a5975ce763e790ed4e1dcf42b8f2d1d",
	value: "5000000000000000000",
});

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
		const tokens = profile.tokens().selected();

		expect(tokens).toBeInstanceOf(WalletTokenCollection);
		expect(tokens.items()[0]).toBeInstanceOf(WalletToken);
	});

	it("should remove dust balance tokens", async () => {
		await profile.tokens().sync();
		const tokens = profile.tokens().selected();

		vi.spyOn(profile.settings(), "get").mockReturnValue(true);
		vi.spyOn(tokens.items()[0], "balance").mockReturnValue(0.1);

		expect(tokens).toBeInstanceOf(WalletTokenCollection);
		expect(tokens.items()[1]).toBeUndefined();
	});

	it("should return transfers", async () => {
		const walletAddress = profile.wallets().first().address();

		server.use(
			http.get(/\/tokens\/transfers.*/, () =>
				HttpResponse.json({
					data: [createTransferData(walletAddress)],
					meta: { next: null, self: "/tokens/transfers?page=1" },
				}),
			),
		);

		const transfers = await profile.tokens().transfers();

		expect(transfers).toBeInstanceOf(ExtendedConfirmedTransactionDataCollection);
		expect(transfers.items()).toHaveLength(1);
		expect(transfers.items()[0].wallet().address()).toBe(walletAddress);
	});

	it("should return selected count", () => {
		const count = profile.tokens().selectedCount();

		expect(count).toBe(1);
	});

	it("should return selected total balance", async () => {
		await profile.tokens().sync();
		const totalBalance = profile.tokens().selectedTotalBalance();

		expect(totalBalance).toBeInstanceOf(BigNumber);
		expect(totalBalance.toNumber()).toBeGreaterThan(0);
	});
});
