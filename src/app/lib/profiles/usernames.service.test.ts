import { describe, vi, beforeEach, afterEach } from "vitest";
import { UsernamesService } from "./usernames.service";
import { test, env, getMainsailProfileId } from "@/utils/testing-library";
import { Collections } from "@/app/lib/mainsail";
import { ClientService } from "@/app/lib/mainsail/client.service";

describe("UsernamesService", () => {
	const profileId = getMainsailProfileId();

	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	test("should return undefined when network is not in registry", async () => {
		const profile = env.profiles().findById(profileId);
		const config = profile.activeNetwork().config();

		const usernamesService = new UsernamesService({ config, profile });

		const result = usernamesService.username("unknown-network", "0x123");
		expect(result).toBeUndefined();
	});

	test("should return false when network is not in registry", async () => {
		const profile = env.profiles().findById(profileId);
		const config = profile.activeNetwork().config();

		const usernamesService = new UsernamesService({ config, profile });

		const result = usernamesService.has("unknown-network", "0x123");
		expect(result).toBe(false);
	});

	test("should return false when address is not found in registry", async () => {
		const profile = env.profiles().findById(profileId);
		const config = profile.activeNetwork().config();

		const usernamesService = new UsernamesService({ config, profile });

		const networkId = profile.activeNetwork().id();
		const result = usernamesService.has(networkId, "0xnonexistent");
		expect(result).toBe(false);
	});

	test("should return undefined when address is not found in registry for username", async () => {
		const profile = env.profiles().findById(profileId);
		const config = profile.activeNetwork().config();

		const usernamesService = new UsernamesService({ config, profile });

		const networkId = profile.activeNetwork().id();
		const result = usernamesService.username(networkId, "0xnonexistent");
		expect(result).toBeUndefined();
	});

	test("should return true if username exists", async () => {
		const profile = env.profiles().findById(profileId);
		const config = profile.activeNetwork().config();

		const usernamesService = new UsernamesService({ config, profile });

		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
		}) as any;

		const result = await usernamesService.usernameExists("testuser", {});
		expect(result).toBe(true);
	});

	test("should return false if username does not exist", async () => {
		const profile = env.profiles().findById(profileId);
		const config = profile.activeNetwork().config();

		const usernamesService = new UsernamesService({ config, profile });

		global.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 404,
		}) as any;

		const result = await usernamesService.usernameExists("nonexistent", {});
		expect(result).toBe(false);
	});

	test("should merge usernames when syncUsernames is called multiple times", async () => {
		const profile = env.profiles().findById(profileId);
		const config = profile.activeNetwork().config();

		const mockItem1 = { address: () => "0x1", username: () => "user1" };
		const mockItem2 = { address: () => "0x2", username: () => "user2" };

		vi.spyOn(ClientService.prototype, "usernames")
			.mockResolvedValueOnce(new Collections.UsernameDataCollection([mockItem1] as any))
			.mockResolvedValueOnce(new Collections.UsernameDataCollection([mockItem2] as any));

		const usernamesService = new UsernamesService({ config, profile });

		await usernamesService.syncUsernames(["0x1"]);
		await usernamesService.syncUsernames(["0x2"]);

		const networkId = profile.activeNetwork().id();
		expect(usernamesService.has(networkId, "0x1")).toBe(true);
		expect(usernamesService.has(networkId, "0x2")).toBe(true);
	});

	test("should merge unique items when syncUsernames is called multiple times", async () => {
		const profile = env.profiles().findById(profileId);
		const config = profile.activeNetwork().config();

		const mockItem1 = { address: () => "0x1", username: () => "user1" };
		const mockItem2 = { address: () => "0x2", username: () => "user2" };

		vi.spyOn(ClientService.prototype, "usernames")
			.mockResolvedValueOnce(new Collections.UsernameDataCollection([mockItem1] as any))
			.mockResolvedValueOnce(new Collections.UsernameDataCollection([mockItem1, mockItem2] as any));

		const usernamesService = new UsernamesService({ config, profile });

		await usernamesService.syncUsernames(["0x1"]);
		await usernamesService.syncUsernames(["0x1", "0x2"]);

		const networkId = profile.activeNetwork().id();
		expect(usernamesService.has(networkId, "0x1")).toBe(true);
		expect(usernamesService.has(networkId, "0x2")).toBe(true);
		expect(usernamesService.username(networkId, "0x2")).toBe("user2");
	});
});
