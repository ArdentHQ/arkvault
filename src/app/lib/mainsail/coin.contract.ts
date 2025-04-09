export interface CryptoConfig {
	pubKeyHash: number;
	wif: number;
}

export const BindingType = {
	AddressService: Symbol.for("Coin<AddressService>"),
	Application: Symbol.for("Coin<Application>"),
	Crypto: Symbol.for("ARK<Crypto>"),
	Height: Symbol.for("ARK<Height>"),
	MultiSignatureSigner: Symbol.for("ARK<MultiSignatureSigner>"),
	TransferBuilder: Symbol.for("Coin<TransferBuilder>"),
};
