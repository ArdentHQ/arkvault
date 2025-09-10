import { ClientService } from "./client.service.js";
import type { ConfigRepository } from "@/app/lib/mainsail";
import type { IProfile } from "@/app/lib/profiles/profile.contract";

export class UnconfirmedTransactionsService {
	#config: ConfigRepository;
	#profile: IProfile;
	#client: ClientService;

	constructor({ config, profile }: { config: ConfigRepository; profile: IProfile }) {
		this.#config = config;
		this.#profile = profile;
		this.#client = new ClientService({ config: this.#config, profile: this.#profile });
	}

	async listUnconfirmed(parameters?: { page?: number; limit?: number; from: string[]; to: string[] }) {
		// TODO: use identifiers param instead once supported in mainsail, as it now filters based on from AND to which only works when sending to yourself
		const requestParams: Record<string, unknown> = {};
		if (parameters && parameters.from.length > 0) {
			requestParams.from = parameters.from.join(",");
		}
		if (parameters && parameters.to.length > 0) {
			requestParams.to = parameters.to.join(",");
		}

		const limit = parameters?.limit;

		const response = await this.#client.unconfirmedTransactions({
			limit,
			...requestParams,
		});

		const results = response.items() ?? [];

		return { results };
	}
}
