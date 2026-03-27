import { describe, vi, beforeEach, afterEach } from "vitest";
import { UsernamesService } from "./usernames.service";
import { test, env, getMainsailProfileId } from "@/utils/testing-library";

describe("UsernamesService", () => {
	const profileId = getMainsailProfileId();

	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	test("should return username for address", async () => {
		const profile = env.profiles().findById(profileId);
		const config = profile.activeNetwork().config();

		const usernamesService = new UsernamesService({ config, profile });

		const usernameSpy = vi.spyOn(usernamesService, "username").mockImplementation((_, address) => {
			if (address === "0x123") {
				return "testuser1";
			}
			return undefined;
		});

		const networkId = profile.activeNetwork().id();
		const result = usernamesService.username(networkId, "0x123");
		expect(result).toBe("testuser1");

		usernameSpy.mockRestore();
	});

	test("should return undefined for unknown address", async () => {
		const profile = env.profiles().findById(profileId);
		const config = profile.activeNetwork().config();

		const usernamesService = new UsernamesService({ config, profile });

		const usernameSpy = vi.spyOn(usernamesService, "username").mockReturnValue(undefined);

		const networkId = profile.activeNetwork().id();
		const result = usernamesService.username(networkId, "0xunknown");
		expect(result).toBeUndefined();

		usernameSpy.mockRestore();
	});

	test("should return true if address has username", async () => {
		const profile = env.profiles().findById(profileId);
		const config = profile.activeNetwork().config();

		const usernamesService = new UsernamesService({ config, profile });

		const hasSpy = vi.spyOn(usernamesService, "has").mockReturnValue(true);

		const networkId = profile.activeNetwork().id();
		const result = usernamesService.has(networkId, "0x123");
		expect(result).toBe(true);

		hasSpy.mockRestore();
	});

	test("should return false for unknown address", async () => {
		const profile = env.profiles().findById(profileId);
		const config = profile.activeNetwork().config();

		const usernamesService = new UsernamesService({ config, profile });

		const hasSpy = vi.spyOn(usernamesService, "has").mockReturnValue(false);

		const networkId = profile.activeNetwork().id();
		const result = usernamesService.has(networkId, "0xunknown");
		expect(result).toBe(false);

		hasSpy.mockRestore();
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

		vi.restoreAllMocks();
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

		vi.restoreAllMocks();
	});
});
