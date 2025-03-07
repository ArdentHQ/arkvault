import { Coins, Http, IoC, Services } from "@ardenthq/sdk";

export class ProberService extends Services.AbstractProberService {
	readonly #configRepository: Coins.ConfigRepository;
	readonly #httpClient: Http.HttpClient;

	public constructor(container: IoC.IContainer) {
		super();

		this.#configRepository = container.get(IoC.BindingType.ConfigRepository);
		this.#httpClient = container.get(IoC.BindingType.HttpClient);
	}

	public override async evaluate(host: string): Promise<boolean> {
		try {
			const { data } = (
				await this.#httpClient.get(`${host}/node/configuration/crypto`.replace(/\/$/, ""))
			).json();

			return data.network.client.token === this.#configRepository.get(Coins.ConfigKey.CurrencyTicker);
		} catch {
			return false;
		}
	}
}
