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
import { TokenService } from "./token.service";

const WalletsTokensEndpoint = "https://dwallets-evm.mainsailhq.com/api/wallets/tokens";
const WalletsTokensPagePath = "/wallets/tokens?page=1";

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

	it("should query with whitelisted contract addresses", async () => {
		const whitelistedSpy = vi.spyOn(profile, "whitelistedContractAddresses").mockReturnValue(["0xabc"]);

		await profile.tokens().sync();
		const tokens = profile.tokens().selected();

		expect(tokens).toBeInstanceOf(WalletTokenCollection);
		expect(whitelistedSpy).toHaveBeenCalledOnce();
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

	it("should set transaction metadata when wallet is found", async () => {
		const walletAddress = profile.wallets().first().address();

		server.use(
			http.get(/\/tokens\/transfers.*/, () =>
				HttpResponse.json({
					data: [
						createTransferData(walletAddress),
						{
							...createTransferData("0x1000000"),
							from: walletAddress,
						},
					],
					meta: { next: null, self: "/tokens/transfers?page=1" },
				}),
			),
		);

		const transfers = await profile.tokens().transfers();

		expect(transfers).toBeInstanceOf(ExtendedConfirmedTransactionDataCollection);
		expect(transfers.items()).toHaveLength(2);
	});

	it("should return selected count", () => {
		const count = profile.tokens().selectedCount();

		expect(count).toBe(1);
	});

	it("should handle when there are no selected addresses", async () => {
		const selectedWalletsSpy = vi.spyOn(profile.wallets(), "selected").mockReturnValue([]);

		await profile.tokens().sync();
		const tokens = profile.tokens().selected();

		expect(tokens).toBeInstanceOf(WalletTokenCollection);
		expect(tokens.items().length).toBe(0);

		selectedWalletsSpy.mockRestore();
	});

	it("should return selected total balance", async () => {
		await profile.tokens().sync();
		const totalBalance = profile.tokens().selectedTotalBalance();

		expect(totalBalance).toBeInstanceOf(BigNumber);
		expect(totalBalance.toNumber()).toBeGreaterThan(0);
	});

	it("should return aggregated tokens", async () => {
		await profile.tokens().sync();
		const aggregated = profile.tokens().aggregated();

		expect(aggregated).toBeInstanceOf(WalletTokenCollection);
	});

	it("should aggregate tokens with duplicate addresses by calculating total balance", async () => {
		const tokenAddress = "0xdeb478251073157e400c3d8d2ed92a85c958f9fa";

		server.use(
			http.get(WalletsTokensEndpoint, () =>
				HttpResponse.json({
					data: [
						{
							addresses: {
								"0xWallet1": "100",
								"0xWallet2": "200",
							},
							decimals: 18,
							name: "DARK20",
							supply: "100000000000000000000000000",
							symbol: "DARK20",
							token: tokenAddress,
						},
					],
					meta: { next: null, self: WalletsTokensPagePath },
				}),
			),
		);

		const tokenService = new TokenService({
			network: profile.activeNetwork(),
			profile,
		});

		await tokenService.sync();
		const aggregated = tokenService.aggregated();

		expect(aggregated).toBeInstanceOf(WalletTokenCollection);
		expect(aggregated.items()).toHaveLength(1);
	});

	it("should return empty collection on sync error", async () => {
		server.use(http.get(WalletsTokensEndpoint, () => HttpResponse.json(null, { status: 500 })));

		const tokenService = new TokenService({
			network: profile.activeNetwork(),
			profile,
		});

		await tokenService.sync();
		const tokens = tokenService.selected();

		expect(tokens.items()).toHaveLength(0);
	});

	it("should return empty collection on transfers error", async () => {
		server.use(http.get(/\/tokens\/transfers.*/, () => HttpResponse.json(null, { status: 500 })));

		const transfers = await profile.tokens().transfers();

		expect(transfers).toBeInstanceOf(ExtendedConfirmedTransactionDataCollection);
		expect(transfers.items()).toHaveLength(0);
	});

	describe("syncOne", () => {
		it("should succesfully resync the wallets in the page", async () => {
			const walletAddress = "0x1";
			const otherWalletAddress = "0x2";

			server.use(
				http.get(WalletsTokensEndpoint, () =>
					HttpResponse.json({
						data: [
							{
								addresses: {
									[walletAddress]: "300",
								},
								decimals: 18,
								name: "DARK20",
								supply: "100000000000000000000000000",
								symbol: "DARK20",
								token: "0x180a864a755fed0144c622df49b83db577befefb",
							},
						],
						meta: { next: null, self: WalletsTokensPagePath },
					}),
				),
			);

			const tokenService = new TokenService({
				network: profile.activeNetwork(),
				profile,
			});

			await tokenService.sync();
			expect(tokenService.selected().items()).toHaveLength(1);

			const otherWalletTokenDTO = new WalletTokenDTO({
				address: otherWalletAddress,
				balance: "999",
				tokenAddress: "0x3",
			});

			const otherTokenDTO = new TokenDTO({
				address: "0x3",
				decimals: 18,
				name: "OTHER",
				supply: "100000000000000000000000000",
				symbol: "OTHER",
				token: "0x3",
			});
			const otherWalletToken = new WalletToken({
				network: profile.activeNetwork(),
				profile,
				token: otherTokenDTO,
				walletToken: otherWalletTokenDTO,
			});
			tokenService.selected().items().push(otherWalletToken);

			expect(tokenService.selected().items()).toHaveLength(2);

			await tokenService.syncOne(walletAddress);

			expect(tokenService.selected().items()).toHaveLength(2);
			expect(tokenService.selected().items()[0].address()).toBe(walletAddress);
			expect(tokenService.selected().items()[0].balanceRaw()).toBe("300");
			expect(tokenService.selected().items()[1].address()).toBe(otherWalletAddress);
			expect(tokenService.selected().items()[1].balanceRaw()).toBe("999");
		});
		it("should do nothing when no address is provided", async () => {
			const tokenService = new TokenService({
				network: profile.activeNetwork(),
				profile,
			});

			await tokenService.syncOne("123");

			expect(tokenService.selected().items()).toHaveLength(0);
		});

		it("should do nothing when address was never synced", async () => {
			const tokenService = new TokenService({
				network: profile.activeNetwork(),
				profile,
			});

			await tokenService.sync();
			const beforeCount = tokenService.selected().items().length;

			await tokenService.syncOne("0x999999");

			expect(tokenService.selected().items()).toHaveLength(beforeCount);
		});

		it("should update existing tokens on the page", async () => {
			const walletAddress = "0x1";
			const newBalanceRaw = "555";

			server.use(
				http.get(WalletsTokensEndpoint, () =>
					HttpResponse.json({
						data: [
							{
								addresses: {
									[walletAddress]: newBalanceRaw,
								},
								decimals: 18,
								name: "DARK20",
								supply: "100000000000000000000000000",
								symbol: "DARK20",
								token: "0x180a864a755fed0144c622df49b83db577befefb",
							},
						],
						meta: { next: null, self: WalletsTokensPagePath },
					}),
				),
			);

			const tokenService = new TokenService({
				network: profile.activeNetwork(),
				profile,
			});

			await tokenService.sync();
			expect(tokenService.selected().items()).toHaveLength(1);

			await tokenService.syncOne(walletAddress);

			expect(tokenService.selected().items()).toHaveLength(1);
			expect(tokenService.selected().items()[0].address()).toBe(walletAddress);
			expect(tokenService.selected().items()[0].balanceRaw()).toBe(newBalanceRaw);
		});

		it("should keep existing items when response has no matching tokens", async () => {
			const walletAddress = "0x1";

			server.use(
				http.get(WalletsTokensEndpoint, () =>
					HttpResponse.json({
						data: [
							{
								addresses: {
									[walletAddress]: "100",
								},
								decimals: 18,
								name: "DARK20",
								supply: "100000000000000000000000000",
								symbol: "DARK20",
								token: "0x180a864a755fed0144c622df49b83db577befefb",
							},
						],
						meta: { next: null, self: WalletsTokensPagePath },
					}),
				),
			);

			const tokenService = new TokenService({
				network: profile.activeNetwork(),
				profile,
			});

			await tokenService.sync();
			expect(tokenService.selected().items()).toHaveLength(1);

			server.use(
				http.get(WalletsTokensEndpoint, () =>
					HttpResponse.json({ data: [], meta: { next: null, self: WalletsTokensPagePath } }),
				),
			);

			await tokenService.syncOne(walletAddress);

			expect(tokenService.selected().items()).toHaveLength(1);
		});

		it("should catch errors without mutating the collection", async () => {
			const walletAddress = "0x1";

			server.use(
				http.get(WalletsTokensEndpoint, () =>
					HttpResponse.json({
						data: [
							{
								addresses: {
									[walletAddress]: "100",
								},
								decimals: 18,
								name: "DARK20",
								supply: "100000000000000000000000000",
								symbol: "DARK20",
								token: "0x180a864a755fed0144c622df49b83db577befefb",
							},
						],
						meta: { next: null, self: WalletsTokensPagePath },
					}),
				),
			);

			const tokenService = new TokenService({
				network: profile.activeNetwork(),
				profile,
			});

			await tokenService.sync();
			expect(tokenService.selected().items()).toHaveLength(1);

			server.use(http.get(WalletsTokensEndpoint, () => HttpResponse.json(null, { status: 500 })));

			await expect(tokenService.syncOne(walletAddress)).resolves.toBeUndefined();
			expect(tokenService.selected().items()).toHaveLength(1);
		});

		it("should update address page mapping with refetched items", async () => {
			const walletAddress = "0x1";

			server.use(
				http.get(WalletsTokensEndpoint, () =>
					HttpResponse.json({
						data: [
							{
								addresses: {
									[walletAddress]: "200",
								},
								decimals: 18,
								name: "DARK20",
								supply: "100000000000000000000000000",
								symbol: "DARK20",
								token: "0x180a864a755fed0144c622df49b83db577befefb",
							},
						],
						meta: { next: null, self: WalletsTokensPagePath },
					}),
				),
			);

			const tokenService = new TokenService({
				network: profile.activeNetwork(),
				profile,
			});

			await tokenService.sync();
			await tokenService.syncOne(walletAddress);

			expect(tokenService.selected().items()).toHaveLength(1);
			expect(tokenService.selected().items()[0].address()).toBe(walletAddress);
			expect(tokenService.selected().items()[0].balanceRaw()).toBe("200");
		});
	});
});
