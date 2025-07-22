import { NetworkConfig } from "./contracts";
import { ConfigManager } from "./config.manager";
import { data as config } from "@/tests/fixtures/coins/mainsail/devnet/cryptoConfiguration.json";

describe("ConfigManager", () => {
	let configManager: ConfigManager;

	beforeEach(() => {
		configManager = new ConfigManager();
	});

	it("should set the config and build constants", () => {
		configManager.setConfig(config);
		expect(configManager.all()).toEqual(
			expect.objectContaining({
				network: config.network,
			}),
		);
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
		expect(() => configManager.setConfig(invalidConfig as unknown as NetworkConfig)).toThrow(
			"Bad milestone at height: 100. The number of validators can only be changed at the beginning of a new round.",
		);
	});

	it("should return the entire config", () => {
		expect(configManager.all()).toBeUndefined();
		configManager.setConfig(config);

		expect(configManager.all()).toEqual(
			expect.objectContaining({
				network: config.network,
			}),
		);
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

	it("should return milestone for height 1 when no height provided", () => {
		configManager.setConfig(config);
		const milestone = configManager.getMilestone();
		expect(milestone.height).toBe(1);
	});

	it("should handle milestone navigation backwards", () => {
		configManager.setConfig(config);
		// First set to a higher height to move index forward
		configManager.getMilestone(200);
		// Then get a lower height to trigger backwards navigation
		const milestone = configManager.getMilestone(50);
		expect(milestone).toEqual(expect.objectContaining({ activeValidators: 53 }));
	});

	it("should find next milestone with new key", () => {
		const configWithMultipleKeys = {
			milestones: [
				{ activeValidators: 51, height: 1, someKey: "value1" },
				{ activeValidators: 51, height: 100, someKey: "value2" },
				{ activeValidators: 51, height: 200, someKey: "value3" },
			],
			network: {},
		};
		configManager.setConfig(configWithMultipleKeys as unknown as NetworkConfig);

		const result = configManager.getNextMilestoneWithNewKey(50, "someKey");
		expect(result).toEqual({
			data: "value2",
			found: true,
			height: 100,
		});
	});

	it("should handle config with multiple milestones for merging", () => {
		const multiMilestoneConfig = {
			milestones: [
				{ activeValidators: 51, feature1: true, height: 1 },
				{ activeValidators: 51, feature2: true, height: 100 },
				{ activeValidators: 51, feature3: true, height: 200 },
			],
			network: {},
		};
		configManager.setConfig(multiMilestoneConfig as unknown as NetworkConfig);
		const milestones = configManager.getMilestones();
		// Should have merged features from previous milestones
		expect(milestones[2]).toEqual(
			expect.objectContaining({
				feature1: true,
				feature2: true,
				feature3: true,
			}),
		);
	});

	it("should continue validation when activeValidators are the same", () => {
		const sameValidatorsConfig = {
			milestones: [
				{ activeValidators: 51, height: 1 },
				{ activeValidators: 51, height: 100 }, // Same validators, should continue
				{ activeValidators: 51, height: 200 },
			],
			network: {},
		};
		// Should not throw error
		expect(() => configManager.setConfig(sameValidatorsConfig as unknown as NetworkConfig)).not.toThrow();
	});

	it("should check if height is new milestone", () => {
		configManager.setConfig(config);
		// Test with a height that matches a milestone
		expect(configManager.isNewMilestone(1)).toBe(true);
		expect(configManager.isNewMilestone(999)).toBe(false);
	});

	it("should handle single milestone config without merging", () => {
		const singleMilestoneConfig = {
			milestones: [{ activeValidators: 51, feature1: true, height: 1 }],
			network: {},
		};
		configManager.setConfig(singleMilestoneConfig as unknown as NetworkConfig);
		const milestones = configManager.getMilestones();
		expect(milestones).toHaveLength(1);
		expect(milestones[0]).toEqual(expect.objectContaining({ feature1: true }));
	});

	it("should handle milestone navigation with exact height match", () => {
		const configWithExactHeights = {
			milestones: [
				{ activeValidators: 51, data: "first", height: 1 },
				{ activeValidators: 51, data: "second", height: 50 },
				{ activeValidators: 51, data: "third", height: 100 },
			],
			network: {},
		};
		configManager.setConfig(configWithExactHeights as unknown as NetworkConfig);

		// Move to higher milestone first
		configManager.getMilestone(100);

		// Then navigate to a lower milestone that requires backward navigation
		const milestone = configManager.getMilestone(1);
		expect(milestone.data).toBe("first");
	});

	it("should handle validation with multiple milestones with same validators", () => {
		const multiSameValidatorsConfig = {
			milestones: [
				{ activeValidators: 51, height: 1 },
				{ activeValidators: 51, height: 52 }, // Same as previous
				{ activeValidators: 51, height: 103 }, // Same as previous
				{ activeValidators: 102, height: 154 }, // Different, valid change
			],
			network: {},
		};
		// Should not throw because all changes are valid
		expect(() => configManager.setConfig(multiSameValidatorsConfig as unknown as NetworkConfig)).not.toThrow();
	});

	it("should handle empty milestones array for validation", () => {
		const emptyMilestonesConfig = {
			milestones: [],
			network: {},
		};
		// This should trigger the validation path but with empty array
		expect(() => configManager.setConfig(emptyMilestonesConfig as unknown as NetworkConfig)).not.toThrow();
	});

	it("should handle milestones without activeValidators", () => {
		const noValidatorsConfig = {
			milestones: [
				{ height: 1, someOtherProperty: "value" },
				{ height: 100, someOtherProperty: "value2" },
			],
			network: {},
		};
		// This should skip validation loop since no activeValidators
		expect(() => configManager.setConfig(noValidatorsConfig as unknown as NetworkConfig)).not.toThrow();
	});
});
