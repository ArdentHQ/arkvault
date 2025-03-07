export type ServiceList = Record<string, any>;

export const BindingType = {
	AddressService: Symbol.for("Coin<AddressService>"),
	BigNumberService: Symbol.for("Coin<BigNumberService>"),
	ClientService: Symbol.for("Coin<ClientService>"),
	ConfigRepository: Symbol.for("Coin<ConfigRepository>"),
	Container: Symbol.for("Coin<Container>"),
	DataTransferObjectService: Symbol.for("Coin<DataTransferObjectService>"),
	DataTransferObjects: Symbol.for("Coin<DataTransferObjects>"),
	ExtendedAddressService: Symbol.for("Coin<ExtendedAddressService>"),
	ExtendedPublicKeyService: Symbol.for("Coin<ExtendedPublicKeyService>"),
	FeeService: Symbol.for("Coin<FeeService>"),
	HttpClient: Symbol.for("Coin<HttpClient>"),
	KeyPairService: Symbol.for("Coin<KeyPairService>"),
	KnownWalletService: Symbol.for("Coin<KnownWalletService>"),
	LedgerService: Symbol.for("Coin<LedgerService>"),
	LedgerTransport: Symbol.for("Coin<LedgerTransport>"),
	LedgerTransportFactory: Symbol.for("Coin<LedgerTransportFactory>"),
	LinkService: Symbol.for("Coin<LinkService>"),
	Manifest: Symbol.for("Coin<Manifest>"),
	MessageService: Symbol.for("Coin<MessageService>"),
	MultiSignatureService: Symbol.for("Coin<MultiSignatureService>"),
	Network: Symbol.for("Coin<Network>"),
	NetworkHostSelector: Symbol.for("Coin<NetworkHostSelector>"),
	NetworkRepository: Symbol.for("Coin<NetworkRepository>"),
	PrivateKeyService: Symbol.for("Coin<PrivateKeyService>"),
	ProberService: Symbol.for("Coin<ProberService>"),
	PublicKeyService: Symbol.for("Coin<PublicKeyService>"),
	ServiceProvider: Symbol.for("Coin<ServiceProvider>"),
	Services: Symbol.for("Coin<Services>"),
	SignatoryService: Symbol.for("Coin<SignatoryService>"),
	Specification: Symbol.for("Coin<Specification>"),
	TransactionService: Symbol.for("Coin<TransactionService>"),
	UsernamesService: Symbol.for("Coin<UsernamesService>"),
	WIFService: Symbol.for("Coin<WIFService>"),
	WalletDiscoveryService: Symbol.for("Coin<WalletDiscoveryService>"),
};

export interface IServiceProvider {
	make(container: any): Promise<any>;
}
