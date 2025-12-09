import { describe, it, expect } from "vitest";
import { ConfigRepository } from "./config.repository";
import { NetworkConfig } from "./network-config";

describe("NetworkConfig", () => {
	const config = new ConfigRepository({
		crypto: {
			network: {
				chainId: 11812,
			},
		},
		network: {
			constants: {
				epoch: "2023-12-21T00:00:00.000Z",
			},
			id: "test-network",
			meta: {
				wif: 186,
			},
		},
	});

	it("should set `chainId`", () => {
		const networkConfig = new NetworkConfig(config);
		expect(networkConfig.chainId()).toBe(11812);
	});

	it("should set `epoch`", () => {
		const networkConfig = new NetworkConfig(config);
		expect(networkConfig.epoch()).toBe("2023-12-21T00:00:00.000Z");
	});

	it("should set `wif`", () => {
		const networkConfig = new NetworkConfig(config);
		expect(networkConfig.wif()).toBe(186);
	});
});
