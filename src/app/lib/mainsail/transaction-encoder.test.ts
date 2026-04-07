import { describe, beforeAll, it, vi } from "vitest";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { Contracts } from "@/app/lib/profiles";
import { TransactionEncoder } from "./transaction-encoder";
import { WalletTokenDTO } from "@/app/lib/profiles/wallet-token.dto";
import { TokenDTO } from "@/app/lib/profiles/token.dto";
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import Fixtures from "@/tests/fixtures/coins/mainsail/devnet/tokens.json";
import { ContractAddresses } from "@arkecosystem/typescript-crypto";

let profile: Contracts.IProfile;

describe("TransactionEncoder", () => {
	let walletTokenDTO: WalletTokenDTO;
	let tokenDTO: TokenDTO;
	let walletToken: WalletToken;
	const validatorPublicKey =
		"a08058db53e2665c84a40f5152e76dd2b652125a6079130d4c315e728bcf4dd1dfb44ac26e82302331d61977d3141118";

	beforeAll(async () => {
		const fixtureData = Fixtures.ByContractAddress.data;
		const walletTokenData = Fixtures.ByWalletAddress.data[0];

		profile = env.profiles().findById(getMainsailProfileId());

		walletTokenDTO = new WalletTokenDTO(walletTokenData);
		tokenDTO = new TokenDTO(fixtureData);
		walletToken = new WalletToken({
			network: profile.activeNetwork(),
			profile,
			token: tokenDTO,
			walletToken: walletTokenDTO,
		});
		vi.spyOn(profile.tokens().selected(), "items").mockReturnValue([walletToken]);
	});

	const tokenEncodedData = {
		data: "0xa9059cbb000000000000000000000000deb478251073157e400c3d8d2ed92a85c958f9fa0000000000000000000000000000000000000000000000056bc75e2d63100000",
		to: "0xdeb478251073157e400c3d8d2ed92a85c958f9fa",
	};

	it("should encode token transfer", async () => {
		const encoder = new TransactionEncoder(profile, profile.activeNetwork());
		const address = walletToken.token().address();

		expect(
			encoder.tokenTransfer(address, {
				recipients: [{ address, amount: 100 }],
				senderAddress: address,
				tokenContractAddress: address,
			}),
		).toEqual(tokenEncodedData);
	});

	it("should get token transfer if token info is provided", async () => {
		const encoder = new TransactionEncoder(profile, profile.activeNetwork());
		const address = walletToken.token().address();
		vi.spyOn(profile.tokens().selected(), "items").mockReturnValue([walletToken]);

		expect(
			encoder.byType(
				{
					recipientAddress: address,
					recipients: [{ address, amount: 100 }],
					senderAddress: address,
					tokenContractAddress: address,
				},
				"transfer",
			),
		).toEqual(tokenEncodedData);
	});

	it("should encode multiPayment", async () => {
		const encoder = new TransactionEncoder(profile, profile.activeNetwork());
		const address = walletToken.token().address();

		const result = encoder.multiPayment([
			{ address, amount: 100 },
			{ address, amount: 200 },
		]);

		expect(result.to).toBe(ContractAddresses.MULTIPAYMENT);
		expect(result.data).toBeDefined();
		expect(result.value).toBeDefined();
	});

	it("should encode updateValidator", async () => {
		const encoder = new TransactionEncoder(profile, profile.activeNetwork());
		const result = encoder.updateValidator(validatorPublicKey);

		expect(result.to).toBe(ContractAddresses.CONSENSUS);
		expect(result.data).toBeDefined();
	});

	it("should encode usernameRegistration", async () => {
		const encoder = new TransactionEncoder(profile, profile.activeNetwork());
		const username = "testuser";

		const result = encoder.usernameRegistration(username);

		expect(result.to).toBe(ContractAddresses.USERNAMES);
		expect(result.data).toBeDefined();
	});

	it("should encode usernameResignation", async () => {
		const encoder = new TransactionEncoder(profile, profile.activeNetwork());

		const result = encoder.usernameResignation();

		expect(result.to).toBe(ContractAddresses.USERNAMES);
		expect(result.data).toBeDefined();
	});

	it("should encode validatorRegistration", async () => {
		const encoder = new TransactionEncoder(profile, profile.activeNetwork());
		const result = encoder.validatorRegistration(validatorPublicKey);

		expect(result.to).toBe(ContractAddresses.CONSENSUS);
		expect(result.data).toBeDefined();
		expect(result.value).toBeDefined();
	});

	it("should encode validatorResignation", async () => {
		const encoder = new TransactionEncoder(profile, profile.activeNetwork());

		const result = encoder.validatorResignation();

		expect(result.to).toBe(ContractAddresses.CONSENSUS);
		expect(result.data).toBeDefined();
	});

	it("should encode contractDeployment", async () => {
		const encoder = new TransactionEncoder(profile, profile.activeNetwork());
		const bytecode = "0x1234";

		const result = encoder.contractDeployment(bytecode);

		expect(result.to).toBe("");
		expect(result.data).toBe(bytecode);
	});

	it("should encode vote", async () => {
		const encoder = new TransactionEncoder(profile, profile.activeNetwork());
		const voteAddress = "0xdeb478251073157e400c3d8d2ed92a85c958f9fa";

		const result = encoder.vote([voteAddress]);

		expect(result.to).toBe(ContractAddresses.CONSENSUS);
		expect(result.data).toBeDefined();
	});

	it("should encode unvote", async () => {
		const encoder = new TransactionEncoder(profile, profile.activeNetwork());

		const result = encoder.vote([]);

		expect(result.to).toBe(ContractAddresses.CONSENSUS);
		expect(result.data).toBeDefined();
	});

	it("should handle transfer without token", async () => {
		const encoder = new TransactionEncoder(profile, profile.activeNetwork());
		const address = walletToken.token().address();
		vi.spyOn(profile.tokens().selected(), "items").mockReturnValue([]);

		const result = encoder.byType(
			{
				recipientAddress: address,
				senderAddress: address,
				tokenContractAddress: address,
			},
			"transfer",
		);

		expect(result.to).toBe(address);
		expect(result.data).toBeUndefined();
	});

	it("should handle transfer with recipientAddress only", async () => {
		const encoder = new TransactionEncoder(profile, profile.activeNetwork());
		const address = walletToken.token().address();

		const result = encoder.byType(
			{
				recipientAddress: address,
				senderAddress: address,
			},
			"transfer",
		);

		expect(result.to).toBe(address);
		expect(result.data).toBeUndefined();
	});

	it("should handle tokenTransfer with empty recipients", async () => {
		const encoder = new TransactionEncoder(profile, profile.activeNetwork());
		const address = walletToken.token().address();

		expect(() =>
			encoder.tokenTransfer(address, {
				recipients: [],
				senderAddress: address,
				tokenContractAddress: address,
			}),
		).toThrow();
	});

	it("should handle tokenTransfer with recipient missing amount", async () => {
		const encoder = new TransactionEncoder(profile, profile.activeNetwork());
		const address = walletToken.token().address();
		vi.spyOn(profile.tokens().selected(), "items").mockReturnValue([walletToken]);

		const result = encoder.tokenTransfer(address, {
			recipients: [{ address }],
			senderAddress: address,
			tokenContractAddress: address,
		});

		expect(result.to).toBe(address);
		expect(result.data).toBeDefined();
	});

	it("should handle vote type in byType", async () => {
		const encoder = new TransactionEncoder(profile, profile.activeNetwork());
		const voteAddress = "0xdeb478251073157e400c3d8d2ed92a85c958f9fa";

		const result = encoder.byType(
			{
				senderAddress: "0x1234",
				voteAddresses: [voteAddress],
			},
			"vote",
		);

		expect(result.to).toBe(ContractAddresses.CONSENSUS);
		expect(result.data).toBeDefined();
	});

	it("should handle validatorRegistration type in byType", async () => {
		const encoder = new TransactionEncoder(profile, profile.activeNetwork());

		const result = encoder.byType(
			{
				senderAddress: "0x1234",
				validatorPublicKey: validatorPublicKey,
			},
			"validatorRegistration",
		);

		expect(result.to).toBe(ContractAddresses.CONSENSUS);
		expect(result.data).toBeDefined();
		expect(result.value).toBeDefined();
	});

	it("should handle validatorResignation type in byType", async () => {
		const encoder = new TransactionEncoder(profile, profile.activeNetwork());

		const result = encoder.byType(
			{
				senderAddress: "0x1234",
			},
			"validatorResignation",
		);

		expect(result.to).toBe(ContractAddresses.CONSENSUS);
		expect(result.data).toBeDefined();
	});

	it("should handle usernameRegistration type in byType", async () => {
		const encoder = new TransactionEncoder(profile, profile.activeNetwork());

		const result = encoder.byType(
			{
				senderAddress: "0x1234",
				username: "testuser",
			},
			"usernameRegistration",
		);

		expect(result.to).toBe(ContractAddresses.USERNAMES);
		expect(result.data).toBeDefined();
	});

	it("should handle usernameResignation type in byType", async () => {
		const encoder = new TransactionEncoder(profile, profile.activeNetwork());

		const result = encoder.byType(
			{
				senderAddress: "0x1234",
			},
			"usernameResignation",
		);

		expect(result.to).toBe(ContractAddresses.USERNAMES);
		expect(result.data).toBeDefined();
	});

	it("should handle contractDeployment type in byType", async () => {
		const encoder = new TransactionEncoder(profile, profile.activeNetwork());
		const bytecode = "0x1234";

		const result = encoder.byType(
			{
				bytecode,
				senderAddress: "0x1234",
			},
			"contractDeployment",
		);

		expect(result.to).toBe("");
		expect(result.data).toBe(bytecode);
	});

	it("should handle updateValidator type in byType", async () => {
		const encoder = new TransactionEncoder(profile, profile.activeNetwork());

		const result = encoder.byType(
			{
				senderAddress: "0x1234",
				validatorPublicKey,
			},
			"updateValidator",
		);

		expect(result.to).toBe(ContractAddresses.CONSENSUS);
		expect(result.data).toBeDefined();
	});

	it("should handle multiPayment type in byType", async () => {
		const encoder = new TransactionEncoder(profile, profile.activeNetwork());
		const address = walletToken.token().address();

		const result = encoder.byType(
			{
				recipients: [
					{ address, amount: 100 },
					{ address, amount: 200 },
				],
				senderAddress: "0x1234",
			},
			"multiPayment",
		);

		expect(result.to).toBe(ContractAddresses.MULTIPAYMENT);
		expect(result.data).toBeDefined();
		expect(result.value).toBeDefined();
	});

	it("should throw for unknown transaction type", async () => {
		const encoder = new TransactionEncoder(profile, profile.activeNetwork());

		expect(() =>
			encoder.byType(
				{
					senderAddress: "0x1234",
				},
				"unknown" as any,
			),
		).toThrow();
	});
});
