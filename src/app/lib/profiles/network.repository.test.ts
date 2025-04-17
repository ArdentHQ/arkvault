/* eslint-disable unicorn/no-array-push-push */
import { describeWithContext } from "@ardenthq/sdk-test";

import { bootContainer } from "../test/mocking.js";
import { NetworkRepository } from "./network.repository.js";
import { Profile } from "./profile.js";

describeWithContext(
	"NetworkRepository",
	{
		coin: "ARK",
		constants: { slip44: 111 },
		currency: { decimals: 8, symbol: "Ѧ", ticker: "ARK" },
		explorer: {
			block: "block/{0}",
			transaction: "transaction/{0}",
			wallet: "wallets/{0}",
		},
		featureFlags: {
			Address: ["mnemonic.bip39", "multiSignature", "privateKey", "publicKey", "validate", "wif"],
			Client: [
				"transaction",
				"transactions",
				"wallet",
				"wallets",
				"delegate",
				"delegates",
				"votes",
				"voters",
				"broadcast",
			],
			Fee: ["all", "calculate"],
			KeyPair: ["mnemonic.bip39", "privateKey", "wif"],
			Ledger: ["getVersion", "getPublicKey", "signTransaction", "signMessage"],
			Message: ["sign", "verify"],
			PrivateKey: ["mnemonic.bip39", "wif"],
			PublicKey: ["mnemonic.bip39", "multiSignature", "wif"],
			Transaction: [
				"delegateRegistration",
				"delegateResignation",
				"estimateExpiration",
				"ipfs.ledgerS",
				"ipfs.ledgerX",
				"ipfs.musig",
				"ipfs",
				"multiPayment.musig",
				"multiPayment",
				"multiSignature.ledgerX",
				"multiSignature.musig",
				"multiSignature",
				"secondSignature",
				"transfer.ledgerS",
				"transfer.ledgerX",
				"transfer.musig",
				"transfer",
				"vote.ledgerS",
				"vote.ledgerX",
				"vote.musig",
				"vote",
			],
			WIF: ["mnemonic.bip39"],
		},
		governance: { delegateCount: 51, votesPerTransaction: 1, votesPerWallet: 1 },
		hosts: [
			{ host: "https://ark-live.arkvault.io/api", type: "full" },
			{ host: "https://ark-live-musig.arkvault.io", type: "musig" },
			{ host: "https://live.arkscan.io", type: "explorer" },
		],
		id: "ark.mainnet",
		importMethods: {
			address: { default: false, permissions: [Array] },
			bip39: { canBeEncrypted: true, default: true, permissions: [Array] },
			publicKey: { default: false, permissions: [Array] },
			secret: { canBeEncrypted: true, default: false, permissions: [Array] },
		},
		knownWallets:
			"https://raw.githubusercontent.com/ArkEcosystem/common/master/mainnet/known-wallets-extended.json",
		meta: { fastDelegateSync: true },
		name: "Mainnet",
		transactions: {
			expirationType: "height",
			fees: { ticker: "ARK", type: "dynamic" },
			memo: true,
			multiPaymentRecipients: 64,
			types: [
				"delegateRegistration",
				"delegateResignation",
				"ipfs",
				"multiPayment",
				"multiSignature",
				"secondSignature",
				"transfer",
				"vote",
			],
		},
		type: "live",
	},
	({ beforeEach, assert, it }) => {
		beforeEach((context) => {
			bootContainer();

			context.subject = new NetworkRepository(
				new Profile({ avatar: "avatar", data: "", id: "uuid", name: "name" }),
			);
		});

		it("#all", (context) => {
			assert.length(Object.keys(context.subject.all()), 0);

			context.subject.push(context);

			assert.length(Object.keys(context.subject.all()), 1);
		});

		it("#allByCoin", (context) => {
			assert.length(Object.keys(context.subject.allByCoin("ARK")), 0);
			assert.length(Object.keys(context.subject.allByCoin("BTC")), 0);

			context.subject.push(context);

			assert.length(Object.keys(context.subject.allByCoin("ARK")), 1);
			assert.length(Object.keys(context.subject.allByCoin("BTC")), 0);
		});

		it("#get", (context) => {
			assert.throws(() => context.subject.get("ark.mainnet"), "Failed to find");

			context.subject.push(context);

			assert.object(context.subject.get("ark.mainnet"));
		});

		it("#push", (context) => {
			assert.length(Object.keys(context.subject.all()), 0);

			context.subject.push(context);

			assert.length(Object.keys(context.subject.all()), 1);

			context.subject.push(context);

			assert.length(Object.keys(context.subject.all()), 1);
		});

		it("#fill", (context) => {
			assert.length(Object.keys(context.subject.all()), 0);

			context.subject.push(context);

			assert.length(Object.keys(context.subject.all()), 1);

			context.subject.fill(context.subject.all());

			assert.length(Object.keys(context.subject.all()), 1);
		});

		it("#forget", (context) => {
			assert.throws(() => context.subject.get("ark.mainnet"), "Failed to find");

			context.subject.push(context);

			assert.not.throws(() => context.subject.get("ark.mainnet"), "Failed to find");

			context.subject.forget("ark.mainnet");

			assert.throws(() => context.subject.get("ark.mainnet"), "Failed to find");
		});
	},
);
