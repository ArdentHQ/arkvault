import { formatString } from "@/app/lib/helpers";
import queryString from "query-string";
import { randomHost } from "@/app/lib/sdk/helpers";

export class LinkService {
	public block(id: string): string {
		return this.#buildURL("blocks/{0}", id);
	}

	public transaction(id: string): string {
		return this.#buildURL("transactions/{0}", id);
	}

	public wallet(id: string): string {
		return this.#buildURL("addresses/{0}", id);
	}

	#buildURL(schema: string, id: string): string {
		// @TODO: Remove hardcoded values.
		//const { host, query } = randomNetworkHostFromConfig(this.#configRepository, "explorer");
		const { host, query } = randomHost(
			[
				{
					host: "https://explorer-evm-test.mainsailhq.com",
					type: "explorer",
				},
			],
			"explorer",
		);

		const url = `${host.replace(/\/$/, "")}/${formatString(schema, id)}`;

		if (query) {
			return `${url}?${queryString.stringify(query)}`;
		}

		return url;
	}
}
