import { ConfigRepository } from "./config";
import { IContainer } from "./container.contracts";
import { HttpClient } from "./http-contracts";
import { KnownWallet, KnownWalletService } from "./known-wallet.contract";
import { BindingType } from "./service-provider.contract";

export class AbstractKnownWalletService implements KnownWalletService {
	protected readonly configRepository: ConfigRepository;
	protected readonly httpClient: HttpClient;

	public constructor(container: IContainer) {
		this.configRepository = container.get(BindingType.ConfigRepository);
		this.httpClient = container.get(BindingType.HttpClient);
	}

	public async all(): Promise<KnownWallet[]> {
		return [];
	}
}
