import { HttpClient } from "./http";
import { CoinManifest, NetworkHostSelector, NetworkManifest } from "./network.models";
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
	LedgerTransportFactory,
	LinkService,
	MessageService,
	MultiSignatureService,
	PrivateKeyService,
	PublicKeyService,
	SignatoryService,
	TransactionService,
	WalletDiscoveryService,
	WIFService,
} from "./services.js";

export interface CoinSpec {
	manifest: CoinManifest;
	ServiceProvider: any;
	dataTransferObjects: Record<string, any>;
}

export interface CoinOptions {
	network: string;
	networks?: Record<string, NetworkManifest>;
	hostSelector?: NetworkHostSelector;
	httpClient: HttpClient;
	ledgerTransportFactory?: LedgerTransportFactory;
}

export interface CoinServices {
	AddressService?: AddressService;
	BigNumberService?: BigNumberService;
	ClientService?: ClientService;
	DataTransferObjectService?: DataTransferObjectService;
	ExtendedAddressService?: ExtendedAddressService;
	FeeService?: FeeService;
	KeyPairService?: KeyPairService;
	KnownWalletService?: KnownWalletService;
	LedgerService?: LedgerService;
	LinkService?: LinkService;
	MessageService?: MessageService;
	MultiSignatureService?: MultiSignatureService;
	PrivateKeyService?: PrivateKeyService;
	PublicKeyService?: PublicKeyService;
	SignatoryService?: SignatoryService;
	TransactionService?: TransactionService;
	WalletDiscoveryService?: WalletDiscoveryService;
	WIFService?: WIFService;
}

export interface CoinBundle {
	services: Record<string, object>; // @TODO: use CoinServices
	dataTransferObjects: object; // @TODO
	manifest: CoinManifest;
	serviceProvider?: any; // @TODO: use IServiceProvider
}
