import { ConfigRepository } from "./config";
import { ExtendedPublicKeyService } from "./extended-public-key.contract";
import { Container } from "./ioc";
import { Manifest } from "./manifest";
import { Network, NetworkRepository } from "./networks";
import { ProberService } from "./prober.contract";
import { BindingType } from "./service-provider.contract";
import {
	AddressService,
	BigNumberService,
	ClientService,
	DataTransferObjectService,
	ExtendedAddressService,
	FeeService,
	KeyPairService,
	KnownWalletService,
	LedgerService,
	LinkService,
	MessageService,
	PrivateKeyService,
	PublicKeyService,
	SignatoryService,
	TransactionService,
	WalletDiscoveryService,
	WIFService,
} from "./services";

export class Coin {
	readonly #container: Container;
	#isSyncing = false;

	public constructor(container: Container) {
		this.#container = container;
	}

	public async __construct(): Promise<void> {
		/* istanbul ignore next */
		if (this.hasBeenSynchronized()) {
			/* istanbul ignore next */
			return;
		}

		/* istanbul ignore next */
		if (this.#isSyncing) {
			/* istanbul ignore next */
			return;
		}

		try {
			this.#isSyncing = true;

			await this.#container.resolve<any>(this.#container.get(BindingType.ServiceProvider)).make(this.#container);

			this.#isSyncing = false;
			/* istanbul ignore next */
		} catch (error) {
			console.log(error);

			/* istanbul ignore next */
			this.#isSyncing = false;

			/* istanbul ignore next */
			throw error;
		}
	}

	public async __destruct(): Promise<void> {
		/* istanbul ignore next */
		if (!this.hasBeenSynchronized()) {
			/* istanbul ignore next */
			return;
		}

		await this.#container.unbindAsync(BindingType.AddressService);
		await this.#container.unbindAsync(BindingType.BigNumberService);
		await this.#container.unbindAsync(BindingType.ClientService);
		await this.#container.unbindAsync(BindingType.DataTransferObjectService);
		await this.#container.unbindAsync(BindingType.ExtendedAddressService);
		await this.#container.unbindAsync(BindingType.ExtendedPublicKeyService);
		await this.#container.unbindAsync(BindingType.FeeService);
		await this.#container.unbindAsync(BindingType.KeyPairService);
		await this.#container.unbindAsync(BindingType.KnownWalletService);
		await this.#container.unbindAsync(BindingType.LedgerService);
		await this.#container.unbindAsync(BindingType.LinkService);
		await this.#container.unbindAsync(BindingType.MessageService);
		await this.#container.unbindAsync(BindingType.PrivateKeyService);
		await this.#container.unbindAsync(BindingType.ProberService);
		await this.#container.unbindAsync(BindingType.PublicKeyService);
		await this.#container.unbindAsync(BindingType.SignatoryService);
		await this.#container.unbindAsync(BindingType.TransactionService);
		await this.#container.unbindAsync(BindingType.WalletDiscoveryService);
		await this.#container.unbindAsync(BindingType.WIFService);
	}

	public hasBeenSynchronized(): boolean {
		return this.#container.has(BindingType.AddressService);
	}

	public network(): Network {
		return this.#container.get(BindingType.Network);
	}

	public networks(): NetworkRepository {
		return this.#container.get(BindingType.NetworkRepository);
	}

	public manifest(): Manifest {
		return this.#container.get(BindingType.Manifest);
	}

	public config(): ConfigRepository {
		return this.#container.get(BindingType.ConfigRepository);
	}

	public address(): AddressService {
		return this.#container.get(BindingType.AddressService);
	}

	public bigNumber(): BigNumberService {
		return this.#container.get(BindingType.BigNumberService);
	}

	public client(): ClientService {
		return this.#container.get(BindingType.ClientService);
	}

	public dataTransferObject(): DataTransferObjectService {
		return this.#container.get(BindingType.DataTransferObjectService);
	}

	public extendedAddress(): ExtendedAddressService {
		return this.#container.get(BindingType.ExtendedAddressService);
	}

	public extendedPublicKey(): ExtendedPublicKeyService {
		return this.#container.get(BindingType.ExtendedPublicKeyService);
	}

	public fee(): FeeService {
		return this.#container.get(BindingType.FeeService);
	}

	public keyPair(): KeyPairService {
		return this.#container.get(BindingType.KeyPairService);
	}

	public knownWallet(): KnownWalletService {
		return this.#container.get(BindingType.KnownWalletService);
	}

	public ledger(): LedgerService {
		return this.#container.get(BindingType.LedgerService);
	}

	public link(): LinkService {
		return this.#container.get(BindingType.LinkService);
	}

	public message(): MessageService {
		return this.#container.get(BindingType.MessageService);
	}

	public privateKey(): PrivateKeyService {
		return this.#container.get(BindingType.PrivateKeyService);
	}

	public prober(): ProberService {
		return this.#container.get(BindingType.ProberService);
	}

	public publicKey(): PublicKeyService {
		return this.#container.get(BindingType.PublicKeyService);
	}

	public signatory(): SignatoryService {
		return this.#container.get(BindingType.SignatoryService);
	}

	public transaction(): TransactionService {
		return this.#container.get(BindingType.TransactionService);
	}

	public walletDiscovery(): WalletDiscoveryService {
		return this.#container.get(BindingType.WalletDiscoveryService);
	}

	public wif(): WIFService {
		return this.#container.get(BindingType.WIFService);
	}
}
