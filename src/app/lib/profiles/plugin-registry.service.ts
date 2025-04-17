/* istanbul ignore file */

import { Http } from "@ardenthq/sdk";
import semver from "semver";

import { container } from "./container.js";
import { Identifiers } from "./container.models.js";
import { IPluginRegistry, IRegistryPlugin } from "./contracts.js";
import { RegistryPlugin } from "./plugin-registry.dto.js";

export class PluginRegistry implements IPluginRegistry {
	readonly #httpClient: Http.HttpClient;

	public constructor() {
		this.#httpClient = container.get<Http.HttpClient>(Identifiers.HttpClient);
	}

	/** {@inheritDoc IPluginRegistry.all} */
	public async all(): Promise<IRegistryPlugin[]> {
		const LIMIT = 250;

		const results: Promise<IRegistryPlugin>[] = [];

		let index = 0;
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const { objects } = (
				await this.#httpClient.get("https://registry.npmjs.com/-/v1/search", {
					from: index * LIMIT,
					size: LIMIT,
					t: Date.now(),
					text: "keywords:" + ["@ardenthq", "wallet-plugin"].join(" "),
				})
			).json();

			if (objects === undefined) {
				break;
			}

			for (const item of objects) {
				if (item.package.links?.repository === undefined) {
					continue;
				}

				results.push(this.#expand(item.package));
			}

			if (objects.length !== LIMIT) {
				break;
			}

			index++;
		}

		return this.#applyWhitelist(await Promise.all(results));
	}

	/** {@inheritDoc IPluginRegistry.size} */
	public async size(package_: IRegistryPlugin): Promise<number> {
		const response = (await this.#httpClient.get(`https://registry.npmjs.com/${package_.id()}`)).json();

		return response.versions[package_.version()].dist?.unpackedSize;
	}

	/** {@inheritDoc IPluginRegistry.downloads} */
	public async downloads(package_: IRegistryPlugin): Promise<number> {
		const response = await this.#httpClient.get(
			`https://api.npmjs.org/downloads/range/2005-01-01:${new Date().getFullYear() + 1}-01-01/${package_.id()}`,
		);

		let result = 0;

		for (const { downloads } of response.json().downloads) {
			result += downloads;
		}

		return result;
	}

	async #applyWhitelist(plugins: IRegistryPlugin[]): Promise<IRegistryPlugin[]> {
		const whitelist: Record<string, string> = (
			await this.#httpClient.get(
				"https://raw.githubusercontent.com/ArdentHQ/wallet-plugins/master/whitelist.json",
			)
		).json();

		const result: IRegistryPlugin[] = [];

		for (const plugin of plugins) {
			const range: string | undefined = whitelist[plugin.name()];

			if (range === undefined) {
				continue;
			}

			if (semver.satisfies(plugin.version(), range)) {
				result.push(plugin);
			}
		}

		return result;
	}

	async #expand(package_: any): Promise<IRegistryPlugin> {
		const result = (await this.#httpClient.get(`https://registry.npmjs.com/${package_.name}`)).json();

		return new RegistryPlugin(package_, result.versions[package_.version]);
	}
}
