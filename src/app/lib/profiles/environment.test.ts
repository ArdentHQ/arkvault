import { describe, expect, it, vi, beforeEach } from "vitest";
import { Environment } from "./environment";

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
});
