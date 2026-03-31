import { describe, expect, it, vi } from "vitest";
import { Environment } from "./environment";
import { StubStorage } from "@/tests/mocks";

describe("Environment", () => {
	vi.mock("@/app/lib/mainsail", () => ({
		Http: {
			HttpClient: vi.fn(),
		},
		Networks: {},
		Services: {},
	}));

	it("should create environment instance", () => {
		const environment = new Environment({} as any);
		expect(environment).toBeDefined();
	});

	it("should return data repository", () => {
		const environment = new Environment({} as any);
		expect(environment.data()).toBeDefined();
	});

	it("should return fees service", () => {
		const environment = new Environment({} as any);
		expect(environment.fees()).toBeDefined();
	});

	it("should return known wallets service", () => {
		const environment = new Environment({} as any);
		expect(environment.knownWallets()).toBeDefined();
	});

	it("should return profiles repository", () => {
		const environment = new Environment({} as any);
		expect(environment.profiles()).toBeDefined();
	});

	it("should return wallets service", () => {
		const environment = new Environment({} as any);
		expect(environment.wallets()).toBeDefined();
	});

	it("should return storage when storage is provided", () => {
		const mockStorage = {
			all: vi.fn().mockResolvedValue({}),
			forget: vi.fn().mockResolvedValue(undefined),
			get: vi.fn().mockResolvedValue(undefined),
			set: vi.fn().mockResolvedValue(undefined),
		};
		const environment = new Environment({ storage: mockStorage } as any);
		expect(environment.storage()).toBeDefined();
	});

	it("should set migrations", () => {
		const environment = new Environment({} as any);
		environment.setMigrations({ schema: {} }, "1.0.0");
		expect(environment.migrationVersion()).toBe("1.0.0");
	});

	it("should return migration schemas", () => {
		const environment = new Environment({} as any);
		environment.setMigrations({ schema: {} }, "1.0.0");
		expect(environment.migrationSchemas()).toEqual({ schema: {} });
	});

	it("should reset with indexeddb storage when no options", () => {
		const environment = new Environment({} as any);
		environment.reset();
		expect(environment.storage()).toBeDefined();
	});

	it("should reset with string storage option", () => {
		const environment = new Environment({} as any);
		environment.reset({ storage: "localstorage" } as any);
		expect(environment.storage()).toBeDefined();
	});

	it("should throw when verifying with corrupted data", async () => {
		const mockStorage = {
			all: vi.fn().mockResolvedValue({ data: 123, profiles: 456 }),
			forget: vi.fn().mockResolvedValue(undefined),
			get: vi.fn().mockResolvedValue(undefined),
			set: vi.fn().mockResolvedValue(undefined),
		};
		const environment = new Environment({ storage: mockStorage } as any);
		await expect(environment.verify()).rejects.toThrow("Terminating due to corrupted state:");
	});

	it("should verify with valid storage data", async () => {
		const mockStorage = new StubStorage();
		const environment = new Environment({ storage: mockStorage } as any);
		await expect(environment.verify({ data: {}, profiles: {} })).resolves.toBeUndefined();
	});

	it("should throw when booting without storage", async () => {
		const environment = new Environment({} as any);
		(environment as any)["#storage"] = undefined;
		await expect(environment.boot()).rejects.toThrow("Please call [verify] before booting the environment.");
	});
});
