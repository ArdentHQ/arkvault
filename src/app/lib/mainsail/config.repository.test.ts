import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConfigRepository, ConfigKey, HostType, hostSelector } from "./config.repository";
import * as HostsHelper from "./helpers/hosts";
import mainnetConfig from "@/app/lib/mainsail/networks/mainsail.mainnet";

describe("ConfigRepository", () => {
	let configRepository: ConfigRepository;
	let mockConfig: any;

	beforeEach(() => {
		mockConfig = {
			network: {
				...mainnetConfig,
				hosts: [
					{
						custom: false,
						enabled: true,
						host: "https://test1.com",
						type: "full",
					},
					{
						custom: true,
						enabled: true,
						host: "https://test2.com",
						type: "full",
					},
				],
				id: "test-network",
			},
		};

		configRepository = new ConfigRepository(mockConfig);
	});

	describe("constructor", () => {
		it("should create instance with valid config", () => {
			expect(configRepository).toBeInstanceOf(ConfigRepository);
		});

		it("should throw error for invalid config", () => {
			expect(() => {
				new ConfigRepository(null as any);
			}).toThrow("Failed to validate the configuration");
		});
	});

	describe("all", () => {
		it("should return the entire config", () => {
			const result = configRepository.all();
			expect(result).toEqual(mockConfig);
		});
	});

	describe("get", () => {
		it("should get a value by key", () => {
			const networkId = configRepository.get("network.id");
			expect(networkId).toBe("test-network");
		});

		it("should get a nested value", () => {
			const ticker = configRepository.get("network.currency.ticker");
			expect(ticker).toBe("ARK");
		});

		it("should return default value when key exists but is undefined", () => {
			const result = configRepository.get("network.currency.ticker", "DEFAULT");
			expect(result).toBe("ARK");
		});

		it("should throw error for unknown key", () => {
			expect(() => {
				configRepository.get("unknown.key");
			}).toThrow("The [unknown.key] is an unknown configuration value.");
		});
	});

	describe("getLoose", () => {
		it("should get a value by key", () => {
			const networkId = configRepository.getLoose("network.id");
			expect(networkId).toBe("test-network");
		});

		it("should return undefined for unknown key", () => {
			const result = configRepository.getLoose("unknown.key");
			expect(result).toBeUndefined();
		});

		it("should return default value for unknown key", () => {
			const result = configRepository.getLoose("unknown.key", "default");
			expect(result).toBe("default");
		});
	});

	describe("set", () => {
		it("should set a value", () => {
			configRepository.set("network.newProperty", "newValue");
			const result = configRepository.get("network.newProperty");
			expect(result).toBe("newValue");
		});

		it("should set a nested value", () => {
			configRepository.set("network.currency.newTicker", "NEW");
			const result = configRepository.get("network.currency.newTicker");
			expect(result).toBe("NEW");
		});
	});

	describe("has", () => {
		it("should return true for existing key", () => {
			expect(configRepository.has("network.id")).toBe(true);
		});

		it("should return false for non-existing key", () => {
			expect(configRepository.has("unknown.key")).toBe(false);
		});
	});

	describe("missing", () => {
		it("should return false for existing key", () => {
			expect(configRepository.missing("network.id")).toBe(false);
		});

		it("should return true for non-existing key", () => {
			expect(configRepository.missing("unknown.key")).toBe(true);
		});
	});

	describe("forget", () => {
		it("should remove an existing key", () => {
			const result = configRepository.forget("network.id");
			expect(result).toBe(true);
			expect(configRepository.has("network.id")).toBe(false);
		});

		it("should return false for non-existing key", () => {
			const result = configRepository.forget("unknown.key");
			expect(result).toBe(false);
		});
	});

	describe("host", () => {
		it("should return host using hostSelector with no custom hosts", () => {
			const mockProfile = {
				hosts: () => ({
					allByNetwork: () => [],
				}),
				settings: () => ({
					get: () => false,
				}),
			};

			const mockHost = { host: "https://test.com" };
			const spy = vi.spyOn(HostsHelper, "filterHostsFromConfig").mockReturnValue([mockHost]);
			const randomHostSpy = vi.spyOn(HostsHelper, "randomHost").mockReturnValue(mockHost);

			const result = configRepository.host("full" as HostType, mockProfile as any);

			expect(result).toBe("https://test.com");
			expect(spy).toHaveBeenCalledWith(configRepository, "full");
			expect(randomHostSpy).toHaveBeenCalledWith([mockHost], "full");

			spy.mockRestore();
			randomHostSpy.mockRestore();
		});

		it("should return host using hostSelector with custom hosts and fallback disabled", () => {
			const mockCustomHost = { custom: true, enabled: true, host: "https://custom.com", type: "full" };
			const mockProfile = {
				hosts: () => ({
					allByNetwork: () => [{ host: mockCustomHost }],
				}),
				settings: () => ({
					get: () => false,
				}),
			};

			const mockDefaultHost = { host: "https://default.com" };
			const spy = vi.spyOn(HostsHelper, "filterHostsFromConfig").mockReturnValue([mockDefaultHost]);
			const randomHostSpy = vi.spyOn(HostsHelper, "randomHost").mockReturnValue(mockCustomHost);

			const result = configRepository.host("full" as HostType, mockProfile as any);

			expect(result).toBe("https://custom.com");
			expect(spy).toHaveBeenCalledWith(configRepository, "full");
			expect(randomHostSpy).toHaveBeenCalledWith([mockCustomHost], "full");

			spy.mockRestore();
			randomHostSpy.mockRestore();
		});

		it("should return host using hostSelector with custom hosts and fallback enabled - custom host not failed", () => {
			const mockCustomHost = {
				custom: true,
				enabled: true,
				failedCount: 0,
				host: "https://custom.com",
				type: "full",
			};
			const mockProfile = {
				hosts: () => ({
					allByNetwork: () => [{ host: mockCustomHost }],
				}),
				settings: () => ({
					get: () => true,
				}),
			};

			const mockDefaultHost = { host: "https://default.com" };
			const spy = vi.spyOn(HostsHelper, "filterHostsFromConfig").mockReturnValue([mockDefaultHost]);
			const randomHostSpy = vi.spyOn(HostsHelper, "randomHost").mockReturnValue(mockCustomHost);

			const result = configRepository.host("full" as HostType, mockProfile as any);

			expect(result).toBe("https://custom.com");
			expect(spy).toHaveBeenCalledWith(configRepository, "full");
			expect(randomHostSpy).toHaveBeenCalledWith([mockCustomHost], "full");

			spy.mockRestore();
			randomHostSpy.mockRestore();
		});

		it("should return host using hostSelector with custom hosts and fallback enabled - custom host failed", () => {
			const mockCustomHost = {
				custom: true,
				enabled: true,
				failedCount: 5,
				host: "https://custom.com",
				type: "full",
			};
			const mockProfile = {
				hosts: () => ({
					allByNetwork: () => [{ host: mockCustomHost }],
				}),
				settings: () => ({
					get: () => true,
				}),
			};

			const mockDefaultHosts = [
				{ custom: false, host: "https://default1.com", type: "full" },
				{ custom: false, host: "https://default2.com", type: "full" },
			];
			const spy = vi.spyOn(HostsHelper, "filterHostsFromConfig").mockReturnValue(mockDefaultHosts);
			const randomHostSpy = vi.spyOn(HostsHelper, "randomHost").mockReturnValue(mockDefaultHosts[0]);

			const result = configRepository.host("full" as HostType, mockProfile as any);

			expect(result).toBe("https://default1.com");
			expect(spy).toHaveBeenCalledWith(configRepository, "full");
			expect(randomHostSpy).toHaveBeenCalled();

			spy.mockRestore();
			randomHostSpy.mockRestore();
		});

		it("should return host using hostSelector with custom hosts and fallback enabled - custom host failed with mixed hosts", () => {
			const mockCustomHost = {
				custom: true,
				enabled: true,
				failedCount: 5,
				host: "https://custom.com",
				type: "full",
			};
			const mockProfile = {
				hosts: () => ({
					allByNetwork: () => [{ host: mockCustomHost }],
				}),
				settings: () => ({
					get: () => true,
				}),
			};

			const mockDefaultHosts = [
				{ custom: true, host: "https://custom-default.com", type: "full" },
				{ custom: false, host: "https://default1.com", type: "full" },
				{ custom: false, host: "https://default2.com", type: "full" },
			];
			const spy = vi.spyOn(HostsHelper, "filterHostsFromConfig").mockReturnValue(mockDefaultHosts);
			const randomHostSpy = vi.spyOn(HostsHelper, "randomHost").mockReturnValue(mockDefaultHosts[1]);

			const result = configRepository.host("full" as HostType, mockProfile as any);

			expect(result).toBe("https://default1.com");
			expect(spy).toHaveBeenCalledWith(configRepository, "full");
			expect(randomHostSpy).toHaveBeenCalled();

			spy.mockRestore();
			randomHostSpy.mockRestore();
		});

		it("should return host using hostSelector with custom hosts and fallback enabled - custom host failed with filter", () => {
			const mockCustomHost = {
				custom: true,
				enabled: true,
				failedCount: 5,
				host: "https://custom.com",
				type: "full",
			};
			const mockProfile = {
				hosts: () => ({
					allByNetwork: () => [{ host: mockCustomHost }],
				}),
				settings: () => ({
					get: () => true,
				}),
			};

			const mockDefaultHosts = [
				{ custom: true, host: "https://custom-default.com", type: "full" },
				{ custom: false, host: "https://default1.com", type: "full" },
				{ custom: false, host: "https://default2.com", type: "full" },
			];
			const filteredHosts = mockDefaultHosts.filter(({ custom }) => !custom);
			const spy = vi.spyOn(HostsHelper, "filterHostsFromConfig").mockReturnValue(mockDefaultHosts);
			const randomHostSpy = vi.spyOn(HostsHelper, "randomHost").mockReturnValue(filteredHosts[0]);

			const result = configRepository.host("full" as HostType, mockProfile as any);

			expect(result).toBe("https://default1.com");
			expect(spy).toHaveBeenCalledWith(configRepository, "full");
			expect(randomHostSpy).toHaveBeenCalled();

			spy.mockRestore();
			randomHostSpy.mockRestore();
		});

		it("should test hostSelector function directly", () => {
			const mockCustomHost = {
				custom: true,
				enabled: true,
				failedCount: 5,
				host: "https://custom.com",
				type: "full",
			};
			const mockProfile = {
				hosts: () => ({
					allByNetwork: () => [{ host: mockCustomHost }],
				}),
				settings: () => ({
					get: () => true,
				}),
			};

			const mockDefaultHosts = [
				{ custom: true, host: "https://custom-default.com", type: "full" },
				{ custom: false, host: "https://default1.com", type: "full" },
				{ custom: false, host: "https://default2.com", type: "full" },
			];
			const spy = vi.spyOn(HostsHelper, "filterHostsFromConfig").mockReturnValue(mockDefaultHosts);
			const randomHostSpy = vi.spyOn(HostsHelper, "randomHost").mockReturnValue(mockDefaultHosts[1]);

			const hostSelectorFn = hostSelector(mockProfile as any);
			const result = hostSelectorFn(configRepository, "full");

			expect(result).toEqual(mockDefaultHosts[1]);
			expect(spy).toHaveBeenCalledWith(configRepository, "full");
			expect(randomHostSpy).toHaveBeenCalled();

			spy.mockRestore();
			randomHostSpy.mockRestore();
		});
	});

	describe("ConfigKey enum", () => {
		it("should have correct key values", () => {
			expect(ConfigKey.Bech32).toBe("network.constants.bech32");
			expect(ConfigKey.CurrencyDecimals).toBe("network.currency.decimals");
			expect(ConfigKey.CurrencyTicker).toBe("network.currency.ticker");
			expect(ConfigKey.Epoch).toBe("network.constants.epoch");
			expect(ConfigKey.KnownWallets).toBe("network.knownWallets");
			expect(ConfigKey.Network).toBe("network");
			expect(ConfigKey.NetworkId).toBe("network.id");
			expect(ConfigKey.NetworkType).toBe("network.type");
			expect(ConfigKey.Slip44).toBe("network.constants.slip44");
			expect(ConfigKey.Wif).toBe("network.meta.wif");
		});
	});
});
