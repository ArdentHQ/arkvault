export interface CryptoConfig {
	pubKeyHash: number;
	wif: number;
}

export const BindingType = {
	Application: Symbol.for("Coin<Application>"),
	Crypto: Symbol.for("ARK<Crypto>"),
	Height: Symbol.for("ARK<Height>"),
	TransferBuilder: Symbol.for("Coin<TransferBuilder>"),
};
