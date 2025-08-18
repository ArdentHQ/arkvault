import { Http } from "@/app/lib/mainsail";
import { HttpClient } from "@/app/lib/mainsail/http-client";
import { UnconfirmedTransactionsResponse } from "./pending-transaction.contract";

/**
 * Small wrapper to call /transactions/unconfirmed on the node.
 */
export class PendingTransactionsService {
	private readonly http: HttpClient;
	private readonly host: string;

	constructor({ httpClient, host }: { httpClient: Http.HttpClient; host: string }) {
		this.http = httpClient;
		this.host = host.replace(/\/+$/, "");
	}

	/**
	 * Returns raw unconfirmed txs from node.
	 */
	public async listUnconfirmed(parameters?: { page?: number; limit?: number }) {
		const query: Record<string, string | number> = {};
		if (parameters?.page) {
			query.page = parameters.page;
		}
		if (parameters?.limit) {
			query.limit = parameters.limit;
		}

		const res = await this.http.get(`${this.host}/transactions/unconfirmed`, query, {
			ttl: 5_000,
		});

		return res.json() as Promise<UnconfirmedTransactionsResponse>;
	}
}
