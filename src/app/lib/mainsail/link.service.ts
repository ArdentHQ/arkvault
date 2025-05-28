import { formatString } from "@/app/lib/helpers";
import { ConfigRepository } from "@/app/lib/mainsail";
import { IProfile } from "@/app/lib/profiles/profile.contract";
import { randomHost } from "@/app/lib/mainsail/helpers/hosts";

export class LinkService {
	#config: ConfigRepository;
	#profile: IProfile;

	constructor({ config, profile }: { config: ConfigRepository; profile: IProfile }) {
		this.#config = config;
		this.#profile = profile;
	}

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
		const explorerUrl = this.#config.host("explorer", this.#profile);

		const { host, query } = randomHost(
			[
				{
					host: explorerUrl,
					type: "explorer",
				},
			],
			"explorer",
		);

		const url = `${host.replace(/\/$/, "")}/${formatString(schema, id)}`;
		const queryString = new URLSearchParams(query).toString();

		if (query) {
			return `${url}?${queryString}`;
		}

		return url;
	}
}
