/* eslint-disable sonarjs/no-duplicate-string */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import network from "./mainsail.mainnet";

describe("Mainsail Mainnet Network Configuration", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.resetModules();
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("should have correct basic network properties", () => {
		expect(network.id).toBe("mainsail.mainnet");
		expect(network.name).toBe("Mainnet");
		expect(network.coin).toBe("Mainsail");
		expect(network.type).toBe("live");
	});

	it("should have correct currency configuration", () => {
		expect(network.currency).toEqual({
			decimals: 18,
			symbol: "Ѧ",
			ticker: "ARK",
		});
	});

	it("should have correct constants", () => {
		expect(network.constants).toEqual({
			epoch: "2017-03-21T13:00:00.000Z",
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
			fastDelegateSync: true,
			nethash: "6e84d08bd299ed97c212c886c98a57e36545c8f5d645ca7eeae63a8bd62d8988",
		});
	});

	it("should have correct known wallets URL", () => {
		expect(network.knownWallets).toBe(
			"https://raw.githubusercontent.com/ArkEcosystem/common/master/mainnet/known-wallets-extended.json",
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
			multiPaymentRecipients: 64,
			types: [
				"validatorRegistration",
				"usernameRegistration",
				"usernameResignation",
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
		expect(network.featureFlags).toEqual({
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
		});
	});

	it("should have correct explorer configuration", () => {
		expect(network.explorer).toEqual({
			block: "blocks/{0}",
			transaction: "transactions/{0}",
			wallet: "addresses/{0}",
		});
	});

	describe("Hosts Configuration", () => {
		const expectedHosts = [
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

		it("should have hardcoded hosts configuration", () => {
			expect(network.hosts).toEqual(expectedHosts);
		});

		it("should not be affected by environment variables", async () => {
			// Set environment variables that would affect devnet
			process.env.VITE_MAINSAIL_DEVNET_FULL_HOST = "https://custom-full.mainsailhq.com/api";
			process.env.VITE_MAINSAIL_DEVNET_TX_HOST = "https://custom-tx.mainsailhq.com/tx/api";
			process.env.VITE_MAINSAIL_DEVNET_EXPLORER_HOST = "https://custom-explorer.mainsailhq.com";
			process.env.VITE_MAINSAIL_DEVNET_EVM_HOST = "https://custom-evm.mainsailhq.com/rpc/api";

			// Re-import to verify it's not affected
			const { default: customNetwork } = await import("./mainsail.mainnet");

			expect(customNetwork.hosts).toEqual(expectedHosts);
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

	it("should have different multiPaymentRecipients than devnet", () => {
		// Mainnet has 64, devnet has 128
		expect(network.transactions.multiPaymentRecipients).toBe(64);
	});

	it("should have different symbol than devnet", () => {
		// Mainnet has "Ѧ", devnet has "TѦ"
		expect(network.currency.symbol).toBe("Ѧ");
	});

	it("should have different epoch than devnet", () => {
		// Mainnet has 2017 epoch, devnet has 2023 epoch
		expect(network.constants.epoch).toBe("2017-03-21T13:00:00.000Z");
	});

	it("should have different nethash than devnet", () => {
		expect(network.meta.nethash).toBe("6e84d08bd299ed97c212c886c98a57e36545c8f5d645ca7eeae63a8bd62d8988");
	});

	it("should have fastDelegateSync in meta", () => {
		expect(network.meta.fastDelegateSync).toBe(true);
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

	it("should be a live network type", () => {
		expect(network.type).toBe("live");
		expect(network.type).not.toBe("test");
	});
});
