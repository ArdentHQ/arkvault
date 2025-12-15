import { describe, it, expect, beforeEach } from "vitest";

import { TokenRepository } from "./token.repository";
import { TokenDTO } from "./token.dto";
import Fixtures from "@/tests/fixtures/coins/mainsail/devnet/tokens.json";

describe("TokenRepository", () => {
	const tokenAddress = Fixtures.ByContractAddress.data.address;
	let repository: TokenRepository;
	let token: TokenDTO;

	beforeEach(() => {
		repository = new TokenRepository();
		token = new TokenDTO(Fixtures.ByContractAddress.data);
	});

	it("should initialize with empty data", () => {
		expect(repository.count()).toBe(0);
		expect(repository.all()).toEqual({});
		expect(repository.keys()).toEqual([]);
		expect(repository.values()).toEqual([]);
	});

	it("should fill repository with tokens", () => {
		const tokens = {
			[tokenAddress]: Fixtures.ByContractAddress.data,
		};

		repository.fill(tokens);

		expect(repository.count()).toBe(1);
		expect(repository.has(tokenAddress)).toBe(true);
	});

	it("should return all tokens", () => {
		repository.push(token);
		const allTokens = repository.all();

		expect(allTokens).toHaveProperty(tokenAddress);
		expect(allTokens[tokenAddress]).toBeInstanceOf(TokenDTO);
	});

	it("should return first token", () => {
		repository.push(token);
		const firstToken = repository.first();

		expect(firstToken).toBeInstanceOf(TokenDTO);
		expect(firstToken.address()).toBe(token.address());
	});

	it("should return last token", () => {
		repository.push(token);
		const lastToken = repository.last();

		expect(lastToken).toBeInstanceOf(TokenDTO);
		expect(lastToken.address()).toBe(token.address());
	});

	it("should return all keys", () => {
		repository.push(token);
		const keys = repository.keys();
		expect(keys).toEqual([tokenAddress]);
	});

	it("should return all values", () => {
		repository.push(token);
		const values = repository.values();
		expect(values).toHaveLength(1);

		expect(values[0]).toBeInstanceOf(TokenDTO);
		expect(values[0].address()).toBe(token.address());
	});

	it("should find token by name", () => {
		repository.push(token);
		const foundToken = repository.findByName("DARK20");

		expect(foundToken).toBeInstanceOf(TokenDTO);
		expect(foundToken?.address()).toBe(token.address());
	});

	it("should return undefined", () => {
		const foundToken = repository.findByName("None");

		expect(foundToken).toBeUndefined();
	});

	it("should push token to repository", () => {
		repository.push(token);

		expect(repository.count()).toBe(1);
		expect(repository.has(token.address())).toBe(true);
	});

	it("should create and push token", () => {
		const newToken = repository.create(Fixtures.ByContractAddress.data);

		expect(repository.count()).toBe(1);
		expect(newToken).toBeInstanceOf(TokenDTO);
		expect(newToken.address()).toBe(token.address());
	});

	it("should check if token exists", () => {
		repository.push(token);

		expect(repository.has(token.address())).toBe(true);
		expect(repository.has("invalid")).toBe(false);
	});

	it("should forget token", () => {
		repository.push(token);

		expect(repository.count()).toBe(1);

		repository.forget(token.address());

		expect(repository.count()).toBe(0);
		expect(repository.has(token.address())).toBe(false);
	});

	it("should throw error when forgetting non-existent token", () => {
		expect(() => repository.forget("invalid")).toThrow("No token found for [invalid].");
	});

	it("should flush all tokens", () => {
		repository.push(token);
		expect(repository.count()).toBe(1);

		repository.flush();

		expect(repository.count()).toBe(0);
		expect(repository.all()).toEqual({});
	});
});
