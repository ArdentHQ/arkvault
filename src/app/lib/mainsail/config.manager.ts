import deepmerge from "deepmerge";
import { NetworkConfig, IMilestone } from "./contracts";
import { get, set } from "@/app/lib/helpers";

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

	public setConfig(config: NetworkConfig): void {
		this.config = {
			milestones: config.milestones,
			network: config.network,
		};

		this.validateMilestones();
		this.buildConstants();
	}

	public all(): NetworkConfig | undefined {
		return this.config;
	}

	public set<T = any>(key: string, value: T): void {
		if (!this.config) {
			throw new Error("Config not found.");
		}

		set(this.config, key, value);
	}

	public get<T = any>(key: string): T {
		return get(this.config ?? {}, key) as T;
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
			throw new Error("Milestone not found.");
		}

		return this.milestones.some((milestone) => milestone.height === height);
	}

	public getMilestone(height?: number): { [key: string]: any } {
		if (!this.milestone || !this.milestones) {
			throw new Error("Milestone not found.");
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
			throw new Error("Config not found.");
		}

		this.milestones = this.config.milestones.sort((a, b) => a.height - b.height);
		this.milestone = {
			data: this.milestones[0],
			index: 0,
		};

		let lastMerged = 0;

		while (lastMerged < this.milestones.length - 1) {
			this.milestones[lastMerged + 1] = deepmerge(this.milestones[lastMerged], this.milestones[lastMerged + 1], {
				arrayMerge:
					/* istanbul ignore next -- @preserve */
					(_, source) => source,
			});
			lastMerged++;
		}
	}

	private validateMilestones(): void {
		if (!this.config) {
			throw new Error("Config not found.");
		}

		const validatorMilestones = this.config.milestones
			.sort((a, b) => a.height - b.height)
			.filter((milestone) => milestone.activeValidators);

		for (let index = 1; index < validatorMilestones.length; index++) {
			const previous = validatorMilestones[index - 1];
			const current = validatorMilestones[index];

			if (previous.activeValidators === current.activeValidators) {
				continue;
			}

			if ((current.height - previous.height) % previous.activeValidators !== 0) {
				throw new Error(
					`Bad milestone at height: ${current.height}. The number of validators can only be changed at the beginning of a new round.`,
				);
			}
		}
	}
}

export const configManager = new ConfigManager();
