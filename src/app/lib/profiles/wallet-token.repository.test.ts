import { describe, it, expect, beforeAll } from "vitest";

import { WalletTokenRepository } from "./wallet-token.repository";
import { WalletTokenDTO } from "./wallet-token.dto";
import { TokenDTO } from "./token.dto";
import Fixtures from "@/tests/fixtures/coins/mainsail/devnet/tokens.json";
import { WalletToken } from "./wallet-token";

describe("WalletTokenRepository", () => {
	let repository: WalletTokenRepository;
	let walletTokenDTO: WalletTokenDTO;
	let tokenDTO: TokenDTO;
	let walletToken: WalletToken;

	const fixtureData = Fixtures.ByContractAddress.data;
	const walletTokenData = Fixtures.ByWalletAddress.data[0];

	beforeAll(() => {
		walletTokenDTO = new WalletTokenDTO(walletTokenData);
		tokenDTO = new TokenDTO(fixtureData);
		walletToken = new WalletToken({ token: tokenDTO, walletToken: walletTokenDTO });
		repository = new WalletTokenRepository();
	});

	it("should initialize with empty data", () => {
		expect(repository.count()).toBe(0);
		expect(repository.all()).toEqual({});
		expect(repository.keys()).toEqual([]);
		expect(repository.values()).toEqual([]);
	});

	it("should have wallet token data", () => {
		repository.push(walletToken);
		expect(repository.count()).toBe(1);
		expect(repository.all()).toEqual({ [walletToken.address()]: walletToken });
		expect(repository.keys()).toEqual([walletToken.address()]);
		expect(repository.values()).toEqual([walletToken]);
	});

	it("#first", () => {
		expect(repository.first()).toEqual(walletToken);
	});

	it("#last", () => {
		expect(repository.last()).toEqual(walletToken);
	});

	it("#findByTokenAddress", () => {
		const found = repository.findByTokenAddress(walletToken.token().address());
		expect(found).toEqual(walletToken);
	});

	it("should create and push wallet token", () => {
		const createdToken = repository.create({
			token: tokenDTO,
			walletToken: walletTokenDTO,
		});

		expect(createdToken).toBeInstanceOf(WalletToken);
		expect(repository.count()).toBe(1);
		expect(repository.has(createdToken.address())).toBe(true);
	});

	it("#has", () => {
		expect(repository.has(walletToken.address())).toBe(true);
	});

	it("#forget", () => {
		const tokenAddress = walletToken.address();

		expect(repository.has(tokenAddress)).toBe(true);
		repository.forget(tokenAddress);

		expect(repository.has(tokenAddress)).toBe(false);
		expect(repository.count()).toBe(0);
	});

	it("should throw error when forgetting non-existent wallet token", () => {
		expect(() => repository.forget("non-existent")).toThrowError("No wallet token found for [non-existent].");
	});

	it("#flush", () => {
		repository.push(walletToken);
		expect(repository.count()).toBe(1);

		repository.flush();
		expect(repository.count()).toBe(0);
		expect(repository.all()).toEqual({});
	});
});
