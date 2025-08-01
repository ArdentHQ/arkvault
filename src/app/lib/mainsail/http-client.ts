import { SocksProxyAgent } from "socks-proxy-agent";
import hash from "string-hash";
import { Cache } from "./cache";
import { Contracts } from "@/app/lib/profiles";
import { HttpResponse } from "@/app/lib/mainsail/http-response";

type RequestOptions = Record<string, any>;
type Primitive = null | undefined | string | number | boolean | symbol | bigint;

export class HttpClient {
	private _bodyFormat!: string;
	private _options: RequestOptions = {};
	private readonly cache: Cache;

	constructor(ttl: number) {
		this.asJson();
		this.cache = new Cache(ttl);
	}

	public asJson(): HttpClient {
		return this.bodyFormat("json").contentType("application/json");
	}

	public bodyFormat(format: string): HttpClient {
		this._bodyFormat = format;
		return this;
	}

	public contentType(contentType: string): HttpClient {
		return this.withHeaders({ "Content-Type": contentType });
	}

	public acceptJson(): HttpClient {
		return this.accept("application/json");
	}

	public accept(contentType: string): HttpClient {
		return this.withHeaders({ Accept: contentType });
	}

	public withHeaders(headers: object): HttpClient {
		this._options.headers = { ...this._options.headers, ...headers };
		return this;
	}

	public withCacheStore(cache: object): HttpClient {
		this._options.cache = cache;
		return this;
	}

	public withOptions(options: object): HttpClient {
		this._options = { ...this._options, ...options };
		return this;
	}

	public withSocksProxy(host: string): HttpClient {
		this._options.agent = new SocksProxyAgent(host);
		return this;
	}

	public async get(url: string, query?: object, options?: { ttl?: number }): Promise<HttpResponse> {
		return this.send("GET", url, { query }, options);
	}

	public async post(url: string, data?: object, query?: object): Promise<HttpResponse> {
		return this.send("POST", url, { data, query });
	}

	public async delete(url: string, data?: object, query?: object): Promise<HttpResponse> {
		return this.send("DELETE", url, { data, query });
	}

	protected async send(
		method: string,
		url: string,
		data?: { query?: object; data?: any; ttl?: boolean },
		options?: { ttl?: number },
	): Promise<HttpResponse> {
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

				let opts = this._options;

				if (method === "GET" && url.includes("github")) {
					this.withHeaders({ "Content-Type": "text/plain" });
				} else {
					this.withHeaders({ Accept: "application/json", "Content-Type": "application/json" });
				}

				if (method === "POST") {
					opts = { ...opts, body: JSON.stringify(data?.data), method: "POST" };
				}

				const response = await fetch(url, opts);
				return new HttpResponse({
					body: await response.text(),
					headers: response.headers as unknown as Record<string, Primitive>,
					statusCode: response.status,
				});
			},
			options?.ttl,
		);
	}

	private buildCacheKey(method: string, url: string, data: any): string {
		const normalizedData = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
		return hash(`${method.toLowerCase()}.${url}.${JSON.stringify(normalizedData)}`).toString();
	}

	public forgetWalletCache(wallet: Contracts.IReadWriteWallet): void {
		const host = wallet.network().config().host("full", wallet.profile());
		const cacheKey = this.buildCacheKey("get", `${host}/wallets/${wallet.address()}`, {});
		this.cache.forget(cacheKey);
	}

	public clearCache(): void {
		this.cache.flush();
	}
}
