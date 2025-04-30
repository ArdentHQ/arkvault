import { formatString } from "@/app/lib/helpers";
import queryString from "query-string";
import { IContainer } from "@/app/lib/sdk/container.contracts";
import { ConfigRepository } from "@/app/lib/sdk/config";
import { randomNetworkHostFromConfig } from "@/app/lib/sdk/helpers";

export class LinkService {
	readonly #configRepository: ConfigRepository;

	public constructor(config: ConfigRepository) {
		this.#configRepository = config
	}

	public block(id: string): string {
		return this.#buildURL(this.#configRepository.get("network.explorer.block"), id);
	}

	public transaction(id: string): string {
		return this.#buildURL(this.#configRepository.get("network.explorer.transaction"), id);
	}

	public wallet(id: string): string {
		return this.#buildURL(this.#configRepository.get("network.explorer.wallet"), id);
	}

	#buildURL(schema: string, id: string): string {
		const { host, query } = randomNetworkHostFromConfig(this.#configRepository, "explorer");

		const url = `${host.replace(/\/$/, "")}/${formatString(schema, id)}`;

		if (query) {
			return `${url}?${queryString.stringify(query)}`;
		}

		return url;
	}
}
