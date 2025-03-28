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
			ttl?: boolean;
		},
		options?: {
			ttl?: number;
		},
	): Promise<Http.HttpResponse> {
		if (data?.query && Object.keys(data.query).length > 0) {
			url = `${url}?${new URLSearchParams(data.query as any)}`;
		}

		const cacheKey: string = hash(`${method}.${url}.${JSON.stringify(data)}`).toString();

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


				if (url === "https://dwallets-evm.mainsailhq.com/api/wallets/0xB9Af96a9e5972503E1a0930744fe1ad985ae03b2") {
					console.log("=======================================")
					console.log("=======================================")
					console.log("=======================================")
					console.log("=======================================")
					console.log("=======================================")
					console.log("=======================================")
					console.log("=======================================")
					console.log("=======================================")
					console.log("=======================================")
					console.log("=======================================")
					console.log("=======================================")

					const response = {
						"data": {
							"address": "0xB9Af96a9e5972503E1a0930744fe1ad985ae03b2",
							"attributes": {
								"validatorApproval": 0.0094,
								"validatorLastBlock": {
									"height": 8948,
									"id": "56bb1277512914e42fca9e4387d6de9456753e5f031894882a0af0ae68e287a0",
									"timestamp": 1_743_066_238_333
								},
								"validatorProducedBlocks": 169,
								"validatorPublicKey": "a6dc6f406b2bbd1ab93d0a2d903b1952a7f6e753bcc18c109646d392a2e4414f38ff25f2ed23d8191cd3e60521a32ec2",
								"validatorRank": 53,
								"validatorResigned": false,
								"validatorVoteBalance": "2348490565932735849056603",
								"validatorVotersCount": 1,
								"vote": "0x12361f0Bd5f95C3Ea8BF34af48F5484b811B5CCe"
							},
							"balance": "2358490566037735849056603",
							"nonce": "2",
							"publicKey": "03ff2e9b086a5137c8425b5cfcb0d65720270030a50a16f6ab237c5876c9b2323a",
							"updated_at": "8948"
						}
					}

					return new Http.Response({
						body: JSON.stringify(response),
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
			},
			options?.ttl,
		);
	}

	public clearCache() {
		this.cache.flush();
	}
}
