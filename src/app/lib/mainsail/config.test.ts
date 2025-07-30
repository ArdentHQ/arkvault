import { describe, it, expect, beforeEach, vi } from "vitest";
import { applyCryptoConfiguration } from "./config";
import * as ConfigManager from "./config.manager";

describe("config", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("applyCryptoConfiguration", () => {
		it("should call configManager.setConfig and configManager.setHeight", () => {
			const mockCrypto = {
				network: {
					hosts: [],
					id: "test-network",
				},
			};
			const mockHeight = 1000;

			const setConfigSpy = vi.spyOn(ConfigManager.configManager, "setConfig").mockImplementation(() => {});
			const setHeightSpy = vi.spyOn(ConfigManager.configManager, "setHeight").mockImplementation(() => {});

			applyCryptoConfiguration({ crypto: mockCrypto, height: mockHeight });

			expect(setConfigSpy).toHaveBeenCalledWith(mockCrypto);
			expect(setHeightSpy).toHaveBeenCalledWith(mockHeight);

			setConfigSpy.mockRestore();
			setHeightSpy.mockRestore();
		});

		it("should handle different crypto configurations", () => {
			const mockCrypto = {
				network: {
					constants: {
						epoch: "2023-01-01T00:00:00.000Z",
						slip44: 1,
					},
					hosts: [{ host: "https://test.com", type: "full" }],
					id: "mainnet",
				},
			};
			const mockHeight = 5000;

			const setConfigSpy = vi.spyOn(ConfigManager.configManager, "setConfig").mockImplementation(() => {});
			const setHeightSpy = vi.spyOn(ConfigManager.configManager, "setHeight").mockImplementation(() => {});

			applyCryptoConfiguration({ crypto: mockCrypto, height: mockHeight });

			expect(setConfigSpy).toHaveBeenCalledWith(mockCrypto);
			expect(setHeightSpy).toHaveBeenCalledWith(mockHeight);

			setConfigSpy.mockRestore();
			setHeightSpy.mockRestore();
		});

		it("should handle zero height", () => {
			const mockCrypto = {
				network: {
					hosts: [],
					id: "test-network",
				},
			};
			const mockHeight = 0;

			const setConfigSpy = vi.spyOn(ConfigManager.configManager, "setConfig").mockImplementation(() => {});
			const setHeightSpy = vi.spyOn(ConfigManager.configManager, "setHeight").mockImplementation(() => {});

			applyCryptoConfiguration({ crypto: mockCrypto, height: mockHeight });

			expect(setConfigSpy).toHaveBeenCalledWith(mockCrypto);
			expect(setHeightSpy).toHaveBeenCalledWith(mockHeight);

			setConfigSpy.mockRestore();
			setHeightSpy.mockRestore();
		});

		it("should handle large height values", () => {
			const mockCrypto = {
				network: {
					hosts: [],
					id: "test-network",
				},
			};
			const mockHeight = 999999;

			const setConfigSpy = vi.spyOn(ConfigManager.configManager, "setConfig").mockImplementation(() => {});
			const setHeightSpy = vi.spyOn(ConfigManager.configManager, "setHeight").mockImplementation(() => {});

			applyCryptoConfiguration({ crypto: mockCrypto, height: mockHeight });

			expect(setConfigSpy).toHaveBeenCalledWith(mockCrypto);
			expect(setHeightSpy).toHaveBeenCalledWith(mockHeight);

			setConfigSpy.mockRestore();
			setHeightSpy.mockRestore();
		});
	});
});
