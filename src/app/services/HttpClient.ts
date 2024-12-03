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

			// Temporarily requesting fees from the old mainsail url, in order to mock transaction flow validations and allow the user to send transactions.
			// @TODO: Remove it once fees are implemented in evm.
			if (url.includes("fees")) {
				const ur = url.replaceAll('dwallets-evm', 'dwallets')
				const response = await fetch(ur, options);

				return new Http.Response({
					body: await response.text(),
					headers: response.headers as unknown as Record<string, Primitive>,
					statusCode: response.status,
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
