import { ConfigRepository } from "./config";
import { Http } from "@/app/lib/sdk";
import { SocksProxyAgent } from "socks-proxy-agent";
import hash from "string-hash";
import { Cache } from "./Cache";
import { Contracts, Environment } from "@ardenthq/sdk-profiles";

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
			ttl?: boolean;
		},
		options?: {
			ttl?: number;
		},
	): Promise<Http.HttpResponse> {
		const cacheKey = this.buildCacheKey(method, url, data);

		if (data?.query && Object.keys(data.query).length > 0) {
			url = `${url}?${new URLSearchParams(data.query as any)}`;
		}

		return this.cache.remember(
			cacheKey,
			async () => {
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

				const response = await fetch(url, options);

				return new Http.Response({
					body: await response.text(),
					headers: response.headers as unknown as Record<string, Primitive>,
					statusCode: response.status,
				});
			},
			options?.ttl,
		);
	}

	private buildCacheKey(method: string, url: string, data?: any) {
		// Remove undefined attributes so the cache key is the same for the same request
		const normalizedData = data
			? Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined))
			: {};

		return hash(`${method.toLowerCase()}.${url}.${JSON.stringify(normalizedData)}`).toString();
	}

	public forgetWalletCache(environment: Environment, wallet: Contracts.IReadWriteWallet) {
		const selectHost = environment.hostSelector(wallet.profile());
		const { host } = selectHost(wallet.coin().config() as unknown as ConfigRepository, "full");

		const cacheKey = this.buildCacheKey("get", `${host}/wallets/${wallet.address()}`, {});

		this.cache.forget(cacheKey);
	}

	public clearCache() {
		this.cache.flush();
	}
}
