import { PBKDF2 } from "@ardenthq/sdk-cryptography";
import { describe } from "@ardenthq/sdk-test";

import { identity } from "../test/fixtures/identity";
import { bootContainer } from "../test/mocking";
import { container } from "./container";
import { Identifiers } from "./container.models";
import { WalletData } from "./contracts";
import { IProfileRepository } from "./profile.repository.contract";

describe("WIF", ({ beforeAll, beforeEach, each, nock, assert, it, loader }) => {
	beforeAll(() => {
		bootContainer();
	});

	beforeEach(async (context) => {
		nock.fake()
			.get("/api/node/configuration")
			.reply(200, loader.json("test/fixtures/client/configuration.json"))
			.get("/api/peers")
			.reply(200, loader.json("test/fixtures/client/peers.json"))
			.get("/api/node/configuration/crypto")
			.reply(200, loader.json("test/fixtures/client/cryptoConfiguration.json"))
			.get("/api/node/syncing")
			.reply(200, loader.json("test/fixtures/client/syncing.json"))

			// default wallet
			.get("/api/wallets/D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW")
			.reply(200, loader.json("test/fixtures/client/wallet.json"))
			.get("/api/wallets/030fde54605c5d53436217a2849d276376d0b0f12c71219cd62b0a4539e1e75acd")
			.reply(200, loader.json("test/fixtures/client/wallet.json"))

			// second wallet
			.get("/api/wallets/022e04844a0f02b1df78dff2c7c4e3200137dfc1183dcee8fc2a411b00fd1877ce")
			.reply(200, loader.json("test/fixtures/client/wallet-2.json"))
			.get("/api/wallets/DNc92FQmYu8G9Xvo6YqhPtRxYsUxdsUn9w")
			.reply(200, loader.json("test/fixtures/client/wallet-2.json"))

			// Musig wallet
			.get("/api/wallets/DML7XEfePpj5qDFb1SbCWxLRhzdTDop7V1")
			.reply(200, loader.json("test/fixtures/client/wallet-musig.json"))
			.get("/api/wallets/02cec9caeb855e54b71e4d60c00889e78107f6136d1f664e5646ebcb2f62dae2c6")
			.reply(200, loader.json("test/fixtures/client/wallet-musig.json"))

			.get("/api/delegates")
			.reply(200, loader.json("test/fixtures/client/delegates-1.json"))
			.get("/api/delegates?page=2")
			.reply(200, loader.json("test/fixtures/client/delegates-2.json"))
			.get("/api/transactions/3e0b2e5ed00b34975abd6dee0ca5bd5560b5bd619b26cf6d8f70030408ec5be3")
			.query(true)
			.reply(200, () => {
				const response = loader.json("test/fixtures/client/transactions.json");
				return { data: response.data[0] };
			})
			.get("/api/transactions/bb9004fa874b534905f9eff201150f7f982622015f33e076c52f1e945ef184ed")
			.query(true)
			.reply(200, () => {
				const response = loader.json("test/fixtures/client/transactions.json");
				return { data: response.data[1] };
			})
			.get("/api/transactions")
			.query(true)
			.reply(200, loader.json("test/fixtures/client/transactions.json"))
			// CryptoCompare
			.get("/data/histoday")
			.query(true)
			.reply(200, loader.json("test/fixtures/markets/cryptocompare/historical.json"))
			.persist();

		const profileRepository: IProfileRepository = container.get(Identifiers.ProfileRepository);
		profileRepository.flush();
		context.profile = await profileRepository.create("John Doe");

		context.subject = await context.profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: identity.mnemonic,
			network: "ark.devnet",
		});
	});

	it("should decrypt the WIF", async (context) => {
		context.subject.data().set(WalletData.EncryptedSigningKey, await PBKDF2.encrypt(identity.mnemonic, "password"));

		assert.is(await context.subject.signingKey().get("password"), identity.mnemonic);
	});

	it("should encrypt the WIF and add it to the wallet", async (context) => {
		await context.subject.signingKey().set(identity.mnemonic, "password");

		assert.is(await context.subject.signingKey().get("password"), identity.mnemonic);
	});

	it("should throw if the WIF is tried to be decrypted without one being set", async (context) => {
		await assert.rejects(
			() => context.subject.signingKey().get("password"),
			"This wallet does not use PBKDF2 encryption.",
		);
	});

	it("should determine if the wallet uses a WIF", (context) => {
		assert.false(context.subject.signingKey().exists());

		context.subject.data().set(WalletData.EncryptedSigningKey, "...");

		assert.true(context.subject.signingKey().exists());
	});

	each(
		"should set the WIF using (%s)",
		async ({ context, dataset }) => {
			assert.false(context.subject.signingKey().exists());

			await context.subject.signingKey().set(dataset, "password");

			assert.true(context.subject.signingKey().exists());
		},
		[
			"bomb open frame quit success evolve gain donate prison very rent later",
			"unaware tunnel sibling bottom color fan student kitten sting seminar usual protect entire air afford potato three now win drastic salmon enable fox day",
			"secret",
		],
	);

	it("should remove the WIF", async (context) => {
		await context.subject.signingKey().set(identity.mnemonic, "password");

		assert.true(context.subject.signingKey().exists());

		await context.subject.signingKey().forget("password");

		assert.false(context.subject.signingKey().exists());
	});

	it("should throw if the WIF is tried to be removed without one being set", (context) => {
		assert.throws(
			() => context.subject.signingKey().forget("password"),
			"This wallet does not use PBKDF2 encryption.",
		);
	});
});
