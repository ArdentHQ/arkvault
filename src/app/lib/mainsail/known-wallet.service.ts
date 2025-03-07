import { Coins, IoC, Services } from "@ardenthq/sdk";

export class KnownWalletService extends Services.AbstractKnownWalletService {
	#source: string | undefined;

	public constructor(container: IoC.IContainer) {
		super(container);

		this.#source = this.configRepository.getLoose<string>(Coins.ConfigKey.KnownWallets);
	}

	public override async all(): Promise<Services.KnownWallet[]> {
		if (!this.#source) {
			return [];
		}

		try {
			const results = (await this.httpClient.get(this.#source)).json();

			if (Array.isArray(results)) {
				return results;
			}

			return [];
		} catch {
			return [];
		}
	}
}
