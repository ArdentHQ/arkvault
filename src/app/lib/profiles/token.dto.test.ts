import { TokenDTO } from "./token.dto";

import { describe, it, expect, beforeAll } from "vitest";
import Fixtures from "@/tests/fixtures/coins/mainsail/devnet/tokens.json";

describe("TokenDTO", () => {
	const Fixture = Fixtures.ByContractAddress.data;
	let token: TokenDTO;

	beforeAll(() => {
		token = new TokenDTO(Fixture.data);
	});

	it("should return the address", () => {
		expect(token.address()).toBe(Fixture.data.address);
	});

	it("should return the decimals", () => {
		expect(token.decimals()).toBe(Fixture.data.decimals);
	});

	it("should return the deployment hash", () => {
		expect(token.deploymentHash()).toBe(Fixture.data.deploymentHash);
	});

	it("should return the name", () => {
		expect(token.name()).toBe(Fixture.data.name);
	});

	it("should return the symbol", () => {
		expect(token.symbol()).toBe(Fixture.data.symbol);
	});

	it("should return the total supply", () => {
		expect(token.totalSupply()).toBe(Fixture.data.totalSupply);
	});

	it("should return the data as JSON", () => {
		expect(token.toJSON()).toEqual(Fixture.data);
	});
});
