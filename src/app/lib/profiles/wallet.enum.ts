/**
 * Defines the data that is allowed to be stored within a wallet.
 *
 * @export
 * @enum {number}
 */
export enum WalletData {
	// Identity
	Coin = "COIN",
	Network = "NETWORK",
	Address = "ADDRESS",
	PublicKey = "PUBLIC_KEY",
	// Other
	Balance = "BALANCE",
	EncryptedSigningKey = "ENCRYPTED_SIGNING_KEY",
	EncryptedConfirmKey = "ENCRYPTED_CONFIRM_KEY",
	BroadcastedTransactions = "BROADCASTED_TRANSACTIONS",
	Delegates = "DELEGATES",
	DerivationPath = "DERIVATION_PATH",
	DerivationType = "DERIVATION_TYPE",
	ExchangeCurrency = "EXCHANGE_CURRENCY",
	ImportMethod = "IMPORT_METHOD",
	MultiSignatureParticipants = "MULTI_SIGNATURE_PARTICIPANTS",
	Sequence = "SEQUENCE",
	SignedTransactions = "SIGNED_TRANSACTIONS",
	Votes = "VOTES",
	VotesAvailable = "VOTES_AVAILABLE",
	VotesUsed = "VOTES_USED",
	PendingMultiSignatures = "PENDING_MULTISIGNATURE_TRANSACTIONS",
	LedgerModel = "LEDGER_MODEL",
	Status = "STATUS",
	IsPrimary = "IS_PRIMARY",
}

/**
 * Defines the flags that are allowed to be stored within a wallet.
 *
 * @export
 * @enum {number}
 */
export enum WalletFlag {
	Starred = "STARRED",
	Hot = "HOT",
	Cold = "COLD",
}

/**
 * Defines the ledger models that are supported for a wallet.
 *
 * @export
 * @enum {number}
 */
export enum WalletLedgerModel {
	NanoX = "nanoX",
	NanoS = "nanoS",
}

/**
 * Defines the settings that are allowed to be stored within a wallet.
 *
 * @export
 * @enum {number}
 */
export enum WalletSetting {
	Alias = "ALIAS",
	Avatar = "AVATAR",
	Peer = "PEER",
}

/**
 * Defines the import methods that can be used for wallets.
 *
 * @export
 * @enum {number}
 */
export const WalletImportMethod = {
	Address: "ADDRESS",
	BIP39: {
		MNEMONIC: "BIP39.MNEMONIC",
		MNEMONIC_WITH_ENCRYPTION: "BIP39.MNEMONIC_WITH_ENCRYPTION",
	},
	BIP44: {
		DERIVATION_PATH: "BIP44.DERIVATION_PATH",
		MNEMONIC: "BIP44.MNEMONIC",
		MNEMONIC_WITH_ENCRYPTION: "BIP44.MNEMONIC_WITH_ENCRYPTION",
	},
	BIP49: {
		DERIVATION_PATH: "BIP49.DERIVATION_PATH",
		MNEMONIC: "BIP49.MNEMONIC",
		MNEMONIC_WITH_ENCRYPTION: "BIP49.MNEMONIC_WITH_ENCRYPTION",
	},
	BIP84: {
		DERIVATION_PATH: "BIP84.DERIVATION_PATH",
		MNEMONIC: "BIP84.MNEMONIC",
		MNEMONIC_WITH_ENCRYPTION: "BIP84.MNEMONIC_WITH_ENCRYPTION",
	},
	PrivateKey: "PRIVATE_KEY",
	PublicKey: "PUBLIC_KEY",
	SECRET: "SECRET",
	SECRET_WITH_ENCRYPTION: "SECRET_WITH_ENCRYPTION",
	WIF: "WIF",
	WIFWithEncryption: "WIF_WITH_ENCRYPTION",
};
