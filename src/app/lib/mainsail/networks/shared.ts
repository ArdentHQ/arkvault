/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */
import { Networks } from "@/app/lib/mainsail";

export const transactions: Networks.NetworkManifestTransactions = {
	expirationType: "height",
	fees: {
		ticker: "ARK",
		type: "dynamic",
	},
	memo: false,
	multiPaymentRecipients: 64,
	types: [
		"validatorRegistration",
		"usernameRegistration",
		"usernameResignation",
		"updateValidator",
		"validatorResignation",
		"multiPayment",
		"transfer",
		"vote",
	],
};

export const importMethods: Networks.NetworkManifestImportMethods = {
	address: {
		default: false,
		permissions: ["read"],
	},
	bip39: {
		canBeEncrypted: true,
		default: true,
		permissions: ["read", "write"],
	},
	bip44: {
		canBeEncrypted: true,
		default: false,
		permissions: ["read", "write"],
	},
	publicKey: {
		default: false,
		permissions: ["read"],
	},
	secret: {
		canBeEncrypted: true,
		default: false,
		permissions: ["read", "write"],
	},
};

export const featureFlags: Networks.NetworkManifestFeatureFlags = {
	Address: ["mnemonic.bip39", "privateKey", "publicKey", "validate", "wif"],
	Client: [
		"transaction",
		"transactions",
		"wallet",
		"wallets",
		"validator",
		"validators",
		"votes",
		"voters",
		"broadcast",
	],
	Fee: ["all", "calculate"],
	KeyPair: ["mnemonic.bip39", "privateKey", "wif"],
	Message: ["sign", "verify"],
	PrivateKey: ["mnemonic.bip39", "wif"],
	PublicKey: ["mnemonic.bip39", "wif"],
	Transaction: [
		"usernameRegistration",
		"usernameResignation",
		"delegateRegistration",
		"delegateResignation",
		"validatorRegistration",
		"validatorResignation",
		"estimateExpiration",
		"multiPayment",
		"transfer",
		"vote",
	],
	WIF: ["mnemonic.bip39"],
};

export const explorer: Networks.NetworkManifestExplorer = {
	block: "blocks/{0}",
	transaction: "transactions/{0}",
	wallet: "addresses/{0}",
};
