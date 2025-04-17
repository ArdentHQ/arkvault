import { UUID } from "@ardenthq/sdk-cryptography";
import { Except } from "type-fest";

import { IPlugin, IPluginRepository } from "./contracts.js";
import { DataRepository } from "./data.repository";
import { PluginRegistry } from "./plugin-registry.service.js";

export class PluginRepository implements IPluginRepository {
	readonly #data: DataRepository;
	readonly #registry: PluginRegistry;

	public constructor() {
		this.#data = new DataRepository();
		this.#registry = new PluginRegistry();
	}

	/** {@inheritDoc IPluginRepository.all} */
	public all(): Record<string, IPlugin> {
		return this.#data.all() as Record<string, IPlugin>;
	}

	/** {@inheritDoc IPluginRepository.first} */
	public first(): IPlugin {
		return this.#data.first();
	}

	/** {@inheritDoc IPluginRepository.last} */
	public last(): IPlugin {
		return this.#data.last();
	}

	/** {@inheritDoc IPluginRepository.keys} */
	public keys(): string[] {
		return this.#data.keys();
	}

	/** {@inheritDoc IPluginRepository.values} */
	public values(): IPlugin[] {
		return this.#data.values();
	}

	/** {@inheritDoc IPluginRepository.push} */
	public push(plugin: Except<IPlugin, "id">): IPlugin {
		const id: string = UUID.random();

		this.#data.set(id, { id, ...plugin });

		return this.findById(id);
	}

	/** {@inheritDoc IPluginRepository.fill} */
	public fill(data: object): void {
		this.#data.fill(data);
	}

	/** {@inheritDoc IPluginRepository.findById} */
	public findById(id: string): IPlugin {
		const plugin: IPlugin | undefined = this.#data.get(id);

		if (!plugin) {
			throw new Error(`Failed to find a plugin for [${id}].`);
		}

		return plugin;
	}

	/** {@inheritDoc IPluginRepository.forget} */
	public forget(id: string): void {
		this.#data.forget(id);
	}

	/** {@inheritDoc IPluginRepository.flush} */
	public flush(): void {
		this.#data.flush();
	}

	/** {@inheritDoc IPluginRepository.count} */
	public count(): number {
		return this.keys().length;
	}

	/** {@inheritDoc IPluginRepository.registry} */
	public registry(): PluginRegistry {
		return this.#registry;
	}
}
