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

	async listUnconfirmed(params?: {
		page?: number; limit?: number; offset?: number;
		from?: string[] | string; to?: string[] | string;
	}) {
		const normalize = (v?: string[] | string) =>
			v == null ? undefined : (Array.isArray(v) ? v : v.split(",")).map(s => s.trim()).filter(Boolean);

		const requestParams: Record<string, unknown> = {};
		const from = normalize(params?.from); if (from?.length) requestParams.from = from;
		const to = normalize(params?.to); if (to?.length) requestParams.to = to;

		const limit = params?.limit;
		const offset = (params?.offset) ??
			(params?.page != null && params?.limit != null ? (params.page - 1) * params.limit : undefined);

		const response = await this.#client.transactions().allUnconfirmed(limit, offset, requestParams);
		const results = (response).results ?? [];
		const totalCount = (response).totalCount ?? results.length;

		return { results, totalCount };
	}
}
