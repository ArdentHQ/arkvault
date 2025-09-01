import { Http } from "@/app/lib/mainsail";
import { HttpClient } from "@/app/lib/mainsail/http-client";
import { UnconfirmedTransactionsResponse } from "./unconfirmed-transaction.contract";

/**
 * Small wrapper to call /transactions/unconfirmed on the node.
 */
export class UnconfirmedTransactionsService {
	private readonly http: HttpClient;
	private readonly host: string;

	constructor({ httpClient, host }: { httpClient: Http.HttpClient; host: string }) {
		this.http = httpClient;
		this.host = host.replace(/\/+$/, "");
	}

	/**
	 * Returns raw unconfirmed txs from node.
	 */
	public async listUnconfirmed(parameters?: { page?: number; limit?: number; from?: string[]; to?: string[] }) {
		const qs = new URLSearchParams();

		if (parameters?.page != null) {
			qs.set("page", String(parameters.page));
		}
		if (parameters?.limit != null) {
			qs.set("limit", String(parameters.limit));
		}

		if (parameters?.from?.length) {
			for (const addr of parameters.from) {
				qs.append("from", addr);
			}
		}

		if (parameters?.to?.length) {
			for (const addr of parameters.to) {
				qs.append("to", addr);
			}
		}

		const url = `${this.host}/transactions/unconfirmed` + (qs.toString() ? `?${qs.toString()}` : "");

		const res = await this.http.get(url, undefined as any, { ttl: 5_000 });
		return res.json() as Promise<UnconfirmedTransactionsResponse>;
	}
}
