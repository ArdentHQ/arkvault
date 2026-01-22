import { describe, it, expect, beforeAll, afterAll } from "vitest";

import { TokenDTO } from "./token.dto";
import Fixtures from "@/tests/fixtures/coins/mainsail/devnet/tokens.json";
import { Contracts } from ".";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { WalletTokenRepository } from "./wallet-token.repository";
import { WalletTokenDTO } from "./wallet-token.dto";
import { WalletToken } from "./wallet-token";
import { WalletTokenCollection } from "@/app/lib/mainsail/wallet-token.collection";
import { ExtendedConfirmedTransactionDataCollection } from "@/app/lib/profiles/transaction.collection";
import * as ClientServiceModule from "@/app/lib/mainsail/client.service";
import { ConfirmedTransactionDataCollection } from "@/app/lib/mainsail/transactions.collection";
import { ConfirmedTransactionData } from "@/app/lib/mainsail/confirmed-transaction.dto";

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
		const tokens = await profile.tokens().selected();
		expect(tokens).toBeInstanceOf(WalletTokenCollection);
		expect(tokens.items()[0]).toBeInstanceOf(WalletToken);
	});

	it("should remove dust balance tokens", async () => {
		const tokens = await profile.tokens().selected();

		vi.spyOn(profile.settings(), "get").mockReturnValue(true);
		vi.spyOn(tokens.items()[0], "balance").mockReturnValue(0.1);

		expect(tokens).toBeInstanceOf(WalletTokenCollection);
		expect(tokens.items()[1]).toBeUndefined();
	});

	describe("transfers", () => {
		const createMockTransfer = (from: string, to: string, transactionHash = "bf060a019f9f5a036f571e2b5bc0227c6a5975ce763e790ed4e1dcf42b8f2d1d") => {
			const transfer = new ConfirmedTransactionData();
			transfer.configure({
				blockNumber: "22773025",
				data: "0xa9059cbb",
				from,
				hash: transactionHash,
				receipt: { status: 1 },
				timestamp: "1769010139522",
				to,
				token: {
					address: "0x180a864a755fed0144c622df49b83db577befefb",
					decimals: 18,
					name: "DARK20",
					symbol: "DARK20",
				},
				value: "5000000000000000000",
			});
			return transfer;
		};

		const createMockPagination = () => ({
			last: undefined,
			next: 0,
			prev: undefined,
			self: undefined,
		});

		it("should return transfers successfully", async () => {
			const walletAddress = profile.wallets().first().address();
			const mockTransfer = createMockTransfer(walletAddress, "0xE3c31e486ccA6Eb2093c0F4883Df949d45B021C5");

			const mockCollection = new ConfirmedTransactionDataCollection([mockTransfer], createMockPagination());

			vi.spyOn(ClientServiceModule.ClientService.prototype, "tokenTransfers").mockResolvedValue(mockCollection);

			const transfers = await profile.tokens().transfers();

			expect(transfers).toBeInstanceOf(ExtendedConfirmedTransactionDataCollection);
			expect(transfers.items()).toHaveLength(1);
		});

		it("should return empty collection on error", async () => {
			vi.spyOn(ClientServiceModule.ClientService.prototype, "tokenTransfers").mockRejectedValue(
				new Error("Network error"),
			);

			const transfers = await profile.tokens().transfers();

			expect(transfers).toBeInstanceOf(ExtendedConfirmedTransactionDataCollection);
			expect(transfers.items()).toHaveLength(0);
		});

		it("should pass query parameters to tokenTransfers", async () => {
			const mockCollection = new ConfirmedTransactionDataCollection([], createMockPagination());

			const tokenTransfersSpy = vi
				.spyOn(ClientServiceModule.ClientService.prototype, "tokenTransfers")
				.mockResolvedValue(mockCollection);

			await profile.tokens().transfers({ limit: 10, page: 2 });

			expect(tokenTransfersSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					limit: 10,
					page: 2,
				}),
			);
		});

		it("should find wallet by from address", async () => {
			const walletAddress = profile.wallets().first().address();
			const mockTransfer = createMockTransfer(walletAddress, "0xE3c31e486ccA6Eb2093c0F4883Df949d45B021C5");

			const mockCollection = new ConfirmedTransactionDataCollection([mockTransfer], createMockPagination());

			vi.spyOn(ClientServiceModule.ClientService.prototype, "tokenTransfers").mockResolvedValue(mockCollection);

			const transfers = await profile.tokens().transfers();

			expect(transfers.items()).toHaveLength(1);
			expect(transfers.items()[0].wallet().address()).toBe(walletAddress);
		});

		it("should find wallet by to address", async () => {
			const walletAddress = profile.wallets().first().address();
			const mockTransfer = createMockTransfer("0xE3c31e486ccA6Eb2093c0F4883Df949d45B021C5", walletAddress);

			const mockCollection = new ConfirmedTransactionDataCollection([mockTransfer], createMockPagination());

			vi.spyOn(ClientServiceModule.ClientService.prototype, "tokenTransfers").mockResolvedValue(mockCollection);

			const transfers = await profile.tokens().transfers();

			expect(transfers.items()).toHaveLength(1);
			expect(transfers.items()[0].wallet().address()).toBe(walletAddress);
		});
	});
});
