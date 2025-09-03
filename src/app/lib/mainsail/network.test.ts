import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Network } from "./network";
import networkManifest from "./networks/mainsail.devnet";
import { manifest as manifest } from "./manifest";
import { ConfigRepository } from "./config.repository";
import { server, requestMock } from "@/tests/mocks/server";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import network from "./networks/mainsail.devnet";

describe("Network", () => {
	let networkInstance: Network;
	let profile

	beforeEach(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		await env.profiles().restore(profile)

		networkInstance = new Network(manifest, networkManifest, profile);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should return the correct coin name", () => {
		expect(networkInstance.coin()).toBe(networkManifest.coin);
	});

	it("should return the correct network coin name", () => {
		expect(networkInstance.coinName()).toBe(networkManifest.coin);
	});

	it("should return the correct ID", () => {
		expect(networkInstance.id()).toBe(networkManifest.id);
	});

	it("should return the correct network name", () => {
		expect(networkInstance.name()).toBe(networkManifest.name);
	});

	it("should return the correct display name for live network", () => {
		expect(networkInstance.displayName()).toBe(`${networkManifest.coin} ${networkManifest.name}`);
	});

	it("should return the correct display name for test network", () => {
		networkManifest.type = "test";
		const testNetworkInstance = new Network(manifest, networkManifest, profile);
		expect(testNetworkInstance.displayName()).toBe(`${networkManifest.coin} ${networkManifest.name}`);
	});

	it("should return the correct explorer URL", () => {
		expect(networkInstance.explorer()).toBe("https://explorer-demo.mainsailhq.com");
	});

	it("should return the correct ticker", () => {
		expect(networkInstance.ticker()).toBe(networkManifest.currency.ticker);
	});

	it("should return the correct symbol", () => {
		expect(networkInstance.symbol()).toBe(networkManifest.currency.symbol);
	});

	it("should identify as a live network", () => {
		networkManifest.type = "live";
		expect(networkInstance.isLive()).toBe(true);
	});

	it("should identify as a test network", () => {
		networkManifest.type = "test";
		const testNetworkInstance = new Network(manifest, networkManifest, profile);
		expect(testNetworkInstance.isTest()).toBe(true);
	});

	it("should return the correct expiration type", () => {
		expect(networkInstance.expirationType()).toBe("height");
	});

	it("should allow voting if governance is defined", () => {
		expect(networkInstance.allowsVoting()).toBe(true);
	});

	it("should not allow voting if governance is not defined", () => {
		const noGovernanceNetwork = new Network(manifest, { ...networkManifest, governance: undefined }, profile);
		expect(noGovernanceNetwork.allowsVoting()).toBe(false);
	});

	it("should return the correct voting method", () => {
		expect(networkInstance.votingMethod()).toBe("simple");
	});

	it("should return default voting method if not defined", () => {
		const noMethodNetwork = new Network(manifest, { ...networkManifest, governance: undefined }, profile);
		expect(noMethodNetwork.votingMethod()).toBe("simple");
	});

	it("should return the correct validator count", () => {
		expect(networkInstance.validatorCount()).toBe(networkManifest.governance?.validatorCount);
	});

	it("should return the correct validator identifier", () => {
		expect(networkInstance.validatorIdentifier()).toBe("publicKey");
	});

	it("should return the correct maximum votes per wallet", () => {
		expect(networkInstance.maximumVotesPerWallet()).toBe(1);
	});

	it("should return the correct maximum votes per transaction", () => {
		expect(networkInstance.maximumVotesPerTransaction()).toBe(1);
	});

	it("should return the correct votes amount step", () => {
		expect(networkInstance.votesAmountStep()).toBe(0);
	});

	it("should return the correct votes amount minimum", () => {
		expect(networkInstance.votesAmountMinimum()).toBe(0);
	});

	it("should return the correct votes amount maximum", () => {
		expect(networkInstance.votesAmountMaximum()).toBe(0);
	});

	it("should use extended public key if meta.extendedPublicKey is true", () => {
		const withExtendedPublicKey = new Network(manifest, { ...networkManifest, meta: { extendedPublicKey: true } }, profile);
		expect(withExtendedPublicKey.usesExtendedPublicKey()).toBe(true);
	});

	it("should not use extended public key if meta.extendedPublicKey is false or undefined", () => {
		const noExtendedPkNetwork = new Network(manifest, { ...networkManifest, meta: { extendedPublicKey: false } }, profile);
		expect(noExtendedPkNetwork.usesExtendedPublicKey()).toBe(false);
	});

	it("should correctly determine if a feature is allowed", () => {
		expect(networkInstance.allows("Transaction.transfer")).toBe(true);
		expect(networkInstance.allows("Transaction.multiPayment")).toBe(true);
	});

	it("should return false if feature is not allowed", () => {
		expect(networkInstance.allows("Ledger.receive")).toBe(false);
		expect(networkInstance.allows("nonexistent.feature")).toBe(false);
	});

	it("should return false for allows if feature is empty string", () => {
		expect(networkInstance.allows("")).toBe(false);
	});

	it("should correctly determine if a feature is denied", () => {
		expect(networkInstance.denies("Ledger.send")).toBe(true);
	});

	it("should correctly determine if it charges zero fees", () => {
		const nonFreeNetwork = new Network(manifest, { ...networkManifest, fees: { type: undefined } }, profile);
		expect(nonFreeNetwork.chargesZeroFees()).toBe(false);

		const freeFeeNetwork = new Network(manifest, { ...networkManifest, fees: { type: "free" } }, profile);
		expect(freeFeeNetwork.chargesZeroFees()).toBe(true);
	});

	it("should return the correct import methods", () => {
		expect(networkInstance.importMethods()).toEqual(networkManifest.importMethods);
	});

	it("should return network meta data", () => {
		expect(networkInstance.meta()).toEqual(networkManifest.meta);
	});

	it("should return false for usesMemo if not defined", () => {
		expect(networkInstance.usesMemo()).toBe(false);
	});

	it("should return true for usesMemo if transactions.memo is true", () => {
		const networkWithMemo = new Network(manifest, { ...networkManifest, transactions: { memo: true } }, profile);
		expect(networkWithMemo.usesMemo()).toBe(true);
	});

	it("should evaluateUrl", async () => {
		server.use(
			requestMock("https://test1.com/node/configuration/crypto", {
				data: {
					network: {
						client: {
							token: "ARK",
						},
					},
				},
			}),
		);
		const result = await networkInstance.evaluateUrl("https://test1.com");
		expect(result).toBe(true);
	});

	it("should return empty object for meta if not defined", () => {
		delete networkManifest.meta;
		const noMetaNetwork = new Network(manifest, networkManifest, profile);
		expect(noMetaNetwork.meta()).toEqual({});
	});

	it("should determine if it uses UTXO", () => {
		expect(networkInstance.usesUTXO()).toBe(false);
	});

	it("should determine if it uses locked balance", () => {
		expect(networkInstance.usesLockedBalance()).toBe(false);
	});

	it("should return the correct multi payment recipients count", () => {
		expect(networkInstance.multiPaymentRecipients()).toBe(networkManifest.transactions.multiPaymentRecipients);
	});

	it("should return the correct word count for BIP39", () => {
		expect(networkInstance.wordCount()).toBe(24);
	});

	it("should return the list of tokens", () => {
		expect(networkInstance.tokens()).toEqual([]);
	});

	it("should return an empty array if no tokens are defined", () => {
		const noTokensNetwork = new Network(manifest, { ...networkManifest, tokens: undefined }, profile);
		expect(noTokensNetwork.tokens()).toEqual([]);
	});

	it("should return the network manifest as an object", () => {
		expect(networkInstance.toObject()).toEqual(networkManifest);
	});

	it("should return the network manifest as a JSON string", () => {
		expect(networkInstance.toJson()).toBe(JSON.stringify(networkManifest));
	});

	it("should not allow Ledger if feature flag is not present or empty", () => {
		const noLedgerNetwork = new Network(manifest, { ...networkManifest, featureFlags: { Ledger: [] } }, profile);
		expect(noLedgerNetwork.allowsLedger()).toBe(false);
	});

	it("should return a ConfigRepository instance", () => {
		expect(networkInstance.config()).toBeInstanceOf(ConfigRepository);
	});

	it("should sync network data", async () => {
		await networkInstance.sync();
		expect(networkInstance.config().get("height")).toBe(34369);
	});

	it("should throw an error if no full host is found during sync", async () => {
		const hosts = networkManifest.hosts.map(host => ({ host: host.host, type: "unknown" }))
		const devnetManifest = { ...networkManifest }

		const noHostNetwork = new Network(manifest, devnetManifest, profile);
		devnetManifest.hosts = hosts

		await expect(noHostNetwork.sync()).rejects.toThrow("Expected network host to be a url but received undefined");
	});

	it("should throw an error if ArkClient crypto() fails during evaluateUrl", async () => {
		await expect(networkInstance.evaluateUrl("http://bad.host")).rejects.toThrow("fetch failed");
	});

	it("should return correct milestone moving forward", () => {
		const milestones = [
			{ data: "first", height: 1 },
			{ data: "second", height: 10 },
			{ data: "third", height: 20 },
		];
		networkInstance.config().set("height", 5);
		networkInstance.config().set("crypto", { milestones: [...milestones] });

		const result = networkInstance.milestone(15);
		expect(result.data).toBe("second");
	});

	it("should return correct milestone moving backward", () => {
		const milestones = [
			{ data: "first", height: 1 },
			{ data: "second", height: 10 },
			{ data: "third", height: 20 },
		];
		networkInstance.config().set("height", 25);
		networkInstance.config().set("crypto", { milestones: [...milestones] });

		const result = networkInstance.milestone(5);
		expect(result.data).toBe("first");
	});

	it("should use current height from config when no height is provided", () => {
		const milestones = [
			{ data: "first", height: 1 },
			{ data: "second", height: 10 },
		];
		networkInstance.config().set("height", 10);
		networkInstance.config().set("crypto", { milestones: [...milestones] });

		const result = networkInstance.milestone();
		expect(result.data).toBe("second");
	});

	it("should default height to 1 if height is null ", () => {
		const milestones = [
			{ data: "first", height: 1 },
			{ data: "second", height: 10 },
		];
		networkInstance.config().set("height", null);
		networkInstance.config().set("crypto", { milestones: [...milestones] });

		const result = networkInstance.milestone();
		expect(result.data).toBe("first");
	});

	it("should for missing milestone", () => {
		networkInstance.config().set("height", undefined);
		networkInstance.config().set("crypto", {});

		expect(() => networkInstance.milestone()).toThrow("The [height] is an unknown configuration value.");
	});
});
