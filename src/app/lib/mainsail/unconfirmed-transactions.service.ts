import { ArkClient } from "@arkecosystem/typescript-client";
import type { ConfigRepository } from "@/app/lib/mainsail";
import type { IProfile } from "@/app/lib/profiles/profile.contract";

export class UnconfirmedTransactionsService {
	readonly #client: ArkClient;

	constructor({ config, profile }: { config: ConfigRepository; profile: IProfile }) {
		this.#client = new ArkClient({
			api: config.host("tx", profile),
			evm: config.host("evm", profile),
		});
	}

	async listUnconfirmed(parameters?: {
		page?: number;
		limit?: number;
		offset?: number;
		from?: string[] | string;
		to?: string[] | string;
	}) {
		const normalize = (v?: string[] | string) =>
			v == null ? undefined : (Array.isArray(v) ? v : v.split(",")).map((s) => s.trim()).filter(Boolean);

		const requestParams: Record<string, unknown> = {};
		const from = normalize(parameters?.from);
		if (from?.length) {
			requestParams.from = from;
		}
		const to = normalize(parameters?.to);
		if (to?.length) {
			requestParams.to = to;
		}

		const limit = parameters?.limit;
		const offset =
			parameters?.offset ??
			(parameters?.page != null && parameters?.limit != null
				? (parameters.page - 1) * parameters.limit
				: undefined);

		const response = await this.#client.transactions().allUnconfirmed(limit, offset, requestParams);
		const results = response.results ?? [];
		const totalCount = response.totalCount ?? results.length;

		return { results, totalCount };
	}
}
