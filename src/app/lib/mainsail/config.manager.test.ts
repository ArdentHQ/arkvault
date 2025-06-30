import { NetworkConfig } from "./contracts";
import { ConfigManager } from "./config.manager";
import { data as config } from "@/tests/fixtures/coins/mainsail/devnet/cryptoConfiguration.json"

describe("ConfigManager", () => {
	let configManager: ConfigManager;

	beforeEach(() => {
		configManager = new ConfigManager();
	});

	it("should set the config and build constants", () => {
		configManager.setConfig(config);
		expect(configManager.all()).toEqual(expect.objectContaining({
			network: config.network,
		}));
		expect(configManager.getMilestones().length).toBe(config.milestones.length);
	});

	it("should throw error for bad milestone validation", () => {
		const invalidConfig = {
			milestones: [
				{ activeValidators: 51, height: 0 },
				{ activeValidators: 100, height: 100 }, // Invalid change
			],
			network: {},
		};
		expect(() => configManager.setConfig(invalidConfig as NetworkConfig)).toThrow(
			"Bad milestone at height: 100. The number of validators can only be changed at the beginning of a new round.",
		);
	});

	it("should return the entire config", () => {
		expect(configManager.all()).toBeUndefined();
		configManager.setConfig(config);

		expect(configManager.all()).toEqual(expect.objectContaining({
			network: config.network,
		}));
	});

	it("should set a value", () => {
		configManager.setConfig(config);
		configManager.set("id", "Mainsail");
		expect(configManager.get("id")).toBe("Mainsail");
	});

	it("should throw error when setting value if config is not found", () => {
		expect(() => configManager.set("network.token", "DEV")).toThrow("Config not found.");
	});

	it("should get a value from the config", () => {
		configManager.setConfig(config);
		const token = configManager.get("network.client.token");
		expect(token).toBe("ARK");
	});

	it("should set the current height", () => {
		configManager.setHeight(150);
		expect(configManager.getHeight()).toBe(150);
	});

	it("should return the current height", () => {
		expect(configManager.getHeight()).toBeUndefined();
		configManager.setHeight(250);
		expect(configManager.getHeight()).toBe(250);
	});

	it("should check if current height is a milestone", () => {
		configManager.setConfig(config);
		configManager.setHeight(200);
		expect(configManager.isNewMilestone()).toBe(false);
	});

	it("should throw error when checking new milestone if milestones are not set", () => {
		expect(() => configManager.isNewMilestone(100)).toThrow("Milestone not found.");
	});

	it("should return the correct milestone for a given height", () => {
		configManager.setConfig(config);
		expect(configManager.getMilestone(50)).toEqual(expect.objectContaining({ activeValidators: 53 }));
		expect(configManager.getMilestone(1)).toEqual(expect.objectContaining({ height: 1 }));
	});

	it("should return the correct milestone for current height", () => {
		configManager.setConfig(config);
		configManager.setHeight(150);
		expect(configManager.getMilestone()).toEqual(expect.objectContaining({ activeValidators: 53 }));
	});

	it("should throw error when getting milestone if milestone or milestones are not set", () => {
		expect(() => configManager.getMilestone(100)).toThrow("Milestone not found.");
	});

	it("should return not found if no next milestone with new key exists", () => {
		configManager.setConfig(config);
		const result = configManager.getNextMilestoneWithNewKey(300, "nonExistentKey");
		expect(result).toEqual({ data: null, found: false, height: 300 });
	});

	it("should throw error when getting next milestone if milestones are not set", () => {
		expect(() => configManager.getNextMilestoneWithNewKey(0, "key")).toThrow(
			"Attempted to get next milestone but none were set",
		);
	});

	it("should return all processed milestones", () => {
		configManager.setConfig(config);
		const milestones = configManager.getMilestones();
		expect(milestones).toBeInstanceOf(Array);
		expect(milestones.length).toBe(config.milestones.length);
	});
});
