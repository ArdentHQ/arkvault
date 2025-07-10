import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UsernameData } from "./username.dto"

describe("UsernameData", () => {
	const data = {
		address: "0x125b484e51Ad990b5b3140931f3BD8eAee85Db23",
		username: "test"
	}

	it("#address", async () => {
		expect(new UsernameData(data).address()).toEqual(data.address)
	});

	it("#username", async () => {
		expect(new UsernameData(data).username()).toEqual(data.username)
	});

	it("#toObject", async () => {
		expect(new UsernameData(data).toObject()).toEqual(data)
	});

	it("#raw", async () => {
		expect(new UsernameData(data).raw()).toEqual(data)
	});
});
