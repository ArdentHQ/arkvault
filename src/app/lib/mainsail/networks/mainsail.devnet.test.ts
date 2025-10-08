/* eslint-disable sonarjs/no-duplicate-string */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import network from "./mainsail.devnet";

describe("Mainsail Devnet Network Configuration", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.resetModules();
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("should have correct basic network properties", () => {
		expect(network.id).toBe("mainsail.devnet");
		expect(network.name).toBe("Devnet");
		expect(network.coin).toBe("Mainsail");
		expect(network.type).toBe("test");
	});

	it("should have correct currency configuration", () => {
		expect(network.currency).toEqual({
			decimals: 18,
			symbol: "TѦ",
			ticker: "ARK",
		});
	});

	it("should have correct constants", () => {
		expect(network.constants).toEqual({
			epoch: "2023-12-21T00:00:00.000Z",
			slip44: 111,
		});
	});

	it("should have correct governance configuration", () => {
		expect(network.governance).toEqual({
			validatorCount: 53,
			votesPerTransaction: 1,
			votesPerWallet: 1,
		});
	});

	it("should have correct meta information", () => {
		expect(network.meta).toEqual({
			ark_slip44: 111,
			chainId: 11812,
			nethash: "560f869ed6713745a12328e7214cb65077e645bb5e57b1e5b323bb915a51f114",
			slip44: 111,
			wif: 186,
		});
	});

	it("should have correct known wallets URL", () => {
		expect(network.knownWallets).toBe(
			"https://raw.githubusercontent.com/ArkEcosystem/common/master/mainsail/devnet/known-wallets-extended.json",
		);
	});

	it("should have correct transaction configuration", () => {
		expect(network.transactions).toEqual({
			expirationType: "height",
			fees: {
				ticker: "ARK",
				type: "dynamic",
			},
			memo: false,
			multiPaymentRecipients: 128,
			types: [
				"validatorRegistration",
				"usernameRegistration",
				"usernameResignation",
				"updateValidator",
				"validatorResignation",
				"multiPayment",
				"transfer",
				"vote",
			],
		});
	});

	it("should have correct import methods", () => {
		expect(network.importMethods).toEqual({
			address: {
				default: false,
				permissions: ["read"],
			},
			bip39: {
				canBeEncrypted: true,
				default: true,
				permissions: ["read", "write"],
			},
			bip44: {
				canBeEncrypted: true,
				default: false,
				permissions: ["read", "write"],
			},
			publicKey: {
				default: false,
				permissions: ["read"],
			},
			secret: {
				canBeEncrypted: true,
				default: false,
				permissions: ["read", "write"],
			},
		});
	});

	it("should have correct feature flags", () => {
		const expectedFeatureFlags = {
			Address: ["mnemonic.bip39", "privateKey", "publicKey", "validate", "wif"],
			Client: [
				"transaction",
				"transactions",
				"wallet",
				"wallets",
				"validator",
				"validators",
				"votes",
				"voters",
				"broadcast",
			],
			Fee: ["all", "calculate"],
			KeyPair: ["mnemonic.bip39", "privateKey", "wif"],
			Message: ["sign", "verify"],
			PrivateKey: ["mnemonic.bip39", "wif"],
			PublicKey: ["mnemonic.bip39", "wif"],
			Transaction: [
				"usernameRegistration",
				"usernameResignation",
				"delegateRegistration",
				"delegateResignation",
				"validatorRegistration",
				"validatorResignation",
				"estimateExpiration",
				"multiPayment",
				"transfer",
				"vote",
			],
			WIF: ["mnemonic.bip39"],
		};
		expect(network.featureFlags).toEqual(expectedFeatureFlags);
	});

	it("should have correct explorer configuration", () => {
		expect(network.explorer).toEqual({
			block: "blocks/{0}",
			transaction: "transactions/{0}",
			wallet: "addresses/{0}",
		});
	});

	describe("Hosts Configuration", () => {
		const defaultHosts = [
			{
				host: "https://testnet.mainsailhq.com/api",
				type: "full",
			},
			{
				host: "https://testnet.mainsailhq.com/tx/api",
				type: "tx",
			},
			{
				host: "https://explorer-demo.mainsailhq.com",
				type: "explorer",
			},
			{
				host: "https://testnet.mainsailhq.com/rpc/api",
				type: "evm",
			},
		];

		it("should use default hosts when environment variables are not set", async () => {
			// Clear environment variables for this test
			delete process.env.VITE_MAINSAIL_DEVNET_FULL_HOST;
			delete process.env.VITE_MAINSAIL_DEVNET_TX_HOST;
			delete process.env.VITE_MAINSAIL_DEVNET_EXPLORER_HOST;
			delete process.env.VITE_MAINSAIL_DEVNET_EVM_HOST;

			// Re-import to get the configuration without env vars
			const { default: networkWithoutEnv } = await import("./mainsail.devnet");

			expect(networkWithoutEnv.hosts).toEqual(defaultHosts);
		});

		it("should use custom full host when VITE_MAINSAIL_DEVNET_FULL_HOST is set", async () => {
			process.env.VITE_MAINSAIL_DEVNET_FULL_HOST = "https://custom-full.mainsailhq.com/api";

			// Re-import to get the updated configuration
			const { default: customNetwork } = await import("./mainsail.devnet");

			const fullHost = customNetwork.hosts.find((host) => host.type === "full");
			expect(fullHost?.host).toBe("https://custom-full.mainsailhq.com/api");
		});

		it("should use custom tx host when VITE_MAINSAIL_DEVNET_TX_HOST is set", async () => {
			process.env.VITE_MAINSAIL_DEVNET_TX_HOST = "https://custom-tx.mainsailhq.com/tx/api";

			const { default: customNetwork } = await import("./mainsail.devnet");

			const txHost = customNetwork.hosts.find((host) => host.type === "tx");
			expect(txHost?.host).toBe("https://custom-tx.mainsailhq.com/tx/api");
		});

		it("should use custom explorer host when VITE_MAINSAIL_DEVNET_EXPLORER_HOST is set", async () => {
			process.env.VITE_MAINSAIL_DEVNET_EXPLORER_HOST = "https://custom-explorer.mainsailhq.com";

			const { default: customNetwork } = await import("./mainsail.devnet");

			const explorerHost = customNetwork.hosts.find((host) => host.type === "explorer");
			expect(explorerHost?.host).toBe("https://custom-explorer.mainsailhq.com");
		});

		it("should use custom evm host when VITE_MAINSAIL_DEVNET_EVM_HOST is set", async () => {
			process.env.VITE_MAINSAIL_DEVNET_EVM_HOST = "https://custom-evm.mainsailhq.com/rpc/api";

			const { default: customNetwork } = await import("./mainsail.devnet");

			const evmHost = customNetwork.hosts.find((host) => host.type === "evm");
			expect(evmHost?.host).toBe("https://custom-evm.mainsailhq.com/rpc/api");
		});

		it("should use all custom hosts when all environment variables are set", async () => {
			process.env.VITE_MAINSAIL_DEVNET_FULL_HOST = "https://custom-full.mainsailhq.com/api";
			process.env.VITE_MAINSAIL_DEVNET_TX_HOST = "https://custom-tx.mainsailhq.com/tx/api";
			process.env.VITE_MAINSAIL_DEVNET_EXPLORER_HOST = "https://custom-explorer.mainsailhq.com";
			process.env.VITE_MAINSAIL_DEVNET_EVM_HOST = "https://custom-evm.mainsailhq.com/rpc/api";

			const { default: customNetwork } = await import("./mainsail.devnet");

			expect(customNetwork.hosts).toEqual([
				{
					host: "https://custom-full.mainsailhq.com/api",
					type: "full",
				},
				{
					host: "https://custom-tx.mainsailhq.com/tx/api",
					type: "tx",
				},
				{
					host: "https://custom-explorer.mainsailhq.com",
					type: "explorer",
				},
				{
					host: "https://custom-evm.mainsailhq.com/rpc/api",
					type: "evm",
				},
			]);
		});
	});

	it("should have all required host types", () => {
		const hostTypes = network.hosts.map((host) => host.type);
		expect(hostTypes).toContain("full");
		expect(hostTypes).toContain("tx");
		expect(hostTypes).toContain("explorer");
		expect(hostTypes).toContain("evm");
	});

	it("should have valid host URLs", () => {
		for (const host of network.hosts) {
			expect(host.host).toMatch(/^https?:\/\/.+/);
		}
	});

	it("should conform to NetworkManifest interface", () => {
		// This test ensures the network object has all required properties
		expect(network).toHaveProperty("id");
		expect(network).toHaveProperty("name");
		expect(network).toHaveProperty("coin");
		expect(network).toHaveProperty("type");
		expect(network).toHaveProperty("currency");
		expect(network).toHaveProperty("constants");
		expect(network).toHaveProperty("governance");
		expect(network).toHaveProperty("hosts");
		expect(network).toHaveProperty("importMethods");
		expect(network).toHaveProperty("knownWallets");
		expect(network).toHaveProperty("meta");
		expect(network).toHaveProperty("transactions");
		expect(network).toHaveProperty("featureFlags");
		expect(network).toHaveProperty("explorer");
	});
});
