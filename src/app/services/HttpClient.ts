import { Http } from "@ardenthq/sdk";
import { SocksProxyAgent } from "socks-proxy-agent";
import hash from "string-hash";
import { Cache } from "./Cache";

type Primitive = null | undefined | string | number | boolean | symbol | bigint;

/* istanbul ignore next -- @preserve */
export class HttpClient extends Http.AbstractRequest {
	private readonly cache: Cache;

	public constructor(ttl: number) {
		super();

		this.cache = new Cache(ttl);
	}

	public withSocksProxy(host: string): HttpClient {
		this._options.agent = new SocksProxyAgent(host);

		return this;
	}

	protected async send(
		method: string,
		url: string,
		data?: {
			query?: object;
			data?: any;
		},
	): Promise<Http.HttpResponse> {
		if (data?.query && Object.keys(data.query).length > 0) {
			url = `${url}?${new URLSearchParams(data.query as any)}`;
		}

		const cacheKey: string = hash(`${method}.${url}.${JSON.stringify(data)}`).toString();

		return this.cache.remember(cacheKey, async () => {
			if (!["GET", "POST"].includes(method)) {
				throw new Error("Received no response. This looks like a bug.");
			}

			let options = this._options;

			if (method === "GET" && url.includes("github")) {
				this.withHeaders({
					"Content-Type": "text/plain",
				});
			} else {
				this.withHeaders({
					Accept: "application/json",
					"Content-Type": "application/json",
				});
			}

			if (method === "POST") {
				options = {
					...options,
					body: JSON.stringify(data?.data),
					method: "POST",
				};
			}

			if (url.startsWith("https://ark-live.arkvault.io/api/wallets/A")) {
				return new Http.Response({
					body: `{ "data": { "address": "ALfqDdsnMxFuccCWTExMVWu1jLgsTzHg8m'", "attributes": {}, "balance": "10000000000", "nonce": "154", "publicKey": "0364c00dee112dee7a1e181b4ad358ad604eac05f1e37bd6d9c208002cd08ae383" } }`,
					headers: {},
					statusCode: 200,
				});
			}

			const response = await fetch(url, options);

			return new Http.Response({
				body: await response.text(),
				headers: response.headers as unknown as Record<string, Primitive>,
				statusCode: response.status,
			});
		});
	}

	public clearCache() {
		this.cache.flush();
	}
}
