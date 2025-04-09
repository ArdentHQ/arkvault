import { Coins, Contracts, Http, Networks } from "@ardenthq/sdk";

export class Request {
	readonly #configRepository: Coins.ConfigRepository;
	readonly #httpClient: Http.HttpClient;
	readonly #hostSelector: Networks.NetworkHostSelector;

	#latestHost?: Networks.NetworkHost = undefined;

	public constructor(
		configRepository: Coins.ConfigRepository,
		httpClient: Http.HttpClient,
		hostSelector: Networks.NetworkHostSelector,
	) {
		this.#configRepository = configRepository;
		this.#httpClient = httpClient;
		this.#hostSelector = hostSelector;
	}

	public latestHost(): Networks.NetworkHost | undefined {
		return this.#latestHost;
	}

	public async get(
		path: string,
		query?: Contracts.KeyValuePair,
		type: Networks.NetworkHostType = "full",
		options?: object,
	): Promise<Contracts.KeyValuePair> {
		return this.#sendRequest(
			({ host }) => this.#httpClient.get(`${host}/${path}`.replace(/\/$/, ""), query?.searchParams, options),
			type,
		);
	}

	public async post(
		path: string,
		{ body, searchParams }: { body; searchParams? },
		type: Networks.NetworkHostType = "full",
	): Promise<Contracts.KeyValuePair> {
		return this.#sendRequest(
			({ host }) => this.#httpClient.post(`${host}/${path}`.replace(/\/$/, ""), body, searchParams || undefined),
			type,
		);
	}

	async #sendRequest(
		callback: (host: Networks.NetworkHost) => Promise<Contracts.KeyValuePair>,
		type?: Networks.NetworkHostType,
	): Promise<Contracts.KeyValuePair> {
		this.#latestHost = this.#hostSelector(this.#configRepository, type);

		if (this.#latestHost.failedCount === undefined) {
			this.#latestHost.failedCount = 0;
		}

		try {
			const response = await callback(this.#latestHost);

			if (response.serverError()) {
				this.#latestHost.failedCount++;
			} else {
				this.#latestHost.failedCount = 0;
			}

			return response.json();
		} catch (error) {
			this.#latestHost.failedCount++;

			throw error;
		}
	}
}
