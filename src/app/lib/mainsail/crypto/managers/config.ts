import deepmerge from "deepmerge";

import { InvalidMilestoneConfigurationError } from "../errors";
import { IMilestone } from "../interfaces/index";
import { NetworkConfig } from "../interfaces/networks";
import * as networks from "../networks/index";
import { NetworkName } from "../types";
import { assocPath, path } from "rambda";

export interface MilestoneSearchResult {
	found: boolean;
	height: number;
	data: any;
}

export class ConfigManager {
	private config: NetworkConfig | undefined;
	private height: number | undefined;
	private milestone: IMilestone | undefined;
	private milestones: Record<string, any> | undefined;

	public constructor() {
		this.setConfig(networks.devnet as unknown as NetworkConfig);
	}

	public setConfig(config: NetworkConfig): void {
		this.config = {
			milestones: config.milestones,
			network: config.network,
		};

		this.validateMilestones();
		this.buildConstants();
	}

	public setFromPreset(network: NetworkName): void {
		this.setConfig(this.getPreset(network));
	}

	public getPreset(network: NetworkName): NetworkConfig {
		return networks[network.toLowerCase()] as any;
	}

	public all(): NetworkConfig | undefined {
		return this.config;
	}

	public set<T = any>(key: string, value: T): void {
		if (!this.config) {
			throw new Error();
		}

		const path = key.split(".");
		this.config = assocPath(path, value, this.config);
	}

	public get<T = any>(key: string): T {
		const pathArray = key.split(".");
		return path(pathArray, this.config) as T;
	}

	public setHeight(value: number): void {
		this.height = value;
	}

	public getHeight(): number | undefined {
		return this.height;
	}

	public isNewMilestone(height?: number): boolean {
		height = height || this.height;

		if (!this.milestones) {
			throw new Error();
		}

		return this.milestones.some((milestone) => milestone.height === height);
	}

	public getMilestone(height?: number): { [key: string]: any } {
		if (!this.milestone || !this.milestones) {
			throw new Error();
		}

		if (!height && this.height) {
			height = this.height;
		}

		if (!height) {
			height = 1;
		}

		while (
			this.milestone.index < this.milestones.length - 1 &&
			height >= this.milestones[this.milestone.index + 1].height
		) {
			this.milestone.index++;
			this.milestone.data = this.milestones[this.milestone.index];
		}

		while (height < this.milestones[this.milestone.index].height) {
			this.milestone.index--;
			this.milestone.data = this.milestones[this.milestone.index];
		}

		return this.milestone.data;
	}

	public getNextMilestoneWithNewKey(previousMilestone: number, key: string): MilestoneSearchResult {
		if (!this.milestones || this.milestones.length === 0) {
			throw new Error(`Attempted to get next milestone but none were set`);
		}

		for (let index = 0; index < this.milestones.length; index++) {
			const milestone = this.milestones[index];
			if (
				milestone[key] &&
				milestone[key] !== this.getMilestone(previousMilestone)[key] &&
				milestone.height > previousMilestone
			) {
				return {
					data: milestone[key],
					found: true,
					height: milestone.height,
				};
			}
		}

		return {
			data: null,
			found: false,
			height: previousMilestone,
		};
	}

	public getMilestones(): any {
		return this.milestones;
	}

	private buildConstants(): void {
		if (!this.config) {
			throw new Error();
		}

		this.milestones = this.config.milestones.sort((a, b) => a.height - b.height);
		this.milestone = {
			data: this.milestones[0],
			index: 0,
		};

		let lastMerged = 0;

		const overwriteMerge = (destination, source, options) => source;

		while (lastMerged < this.milestones.length - 1) {
			this.milestones[lastMerged + 1] = deepmerge(this.milestones[lastMerged], this.milestones[lastMerged + 1], {
				arrayMerge: overwriteMerge,
			});
			lastMerged++;
		}
	}

	private validateMilestones(): void {
		if (!this.config) {
			throw new Error();
		}

		const delegateMilestones = this.config.milestones
			.sort((a, b) => a.height - b.height)
			.filter((milestone) => milestone.activeValidators);

		for (let index = 1; index < delegateMilestones.length; index++) {
			const previous = delegateMilestones[index - 1];
			const current = delegateMilestones[index];

			if (previous.activeValidators === current.activeValidators) {
				continue;
			}

			if ((current.height - previous.height) % previous.activeValidators !== 0) {
				throw new InvalidMilestoneConfigurationError(
					`Bad milestone at height: ${current.height}. The number of delegates can only be changed at the beginning of a new round.`,
				);
			}
		}
	}
}

export const configManager = new ConfigManager();
