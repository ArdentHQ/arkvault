import { describe } from "@ardenthq/sdk-test";

import { identity } from "../test/fixtures/identity";
import { bootContainer } from "../test/mocking";
import { container } from "./container";
import { Identifiers } from "./container.models";
import { WalletData } from "./wallet.enum";

describe("VoteRegistry", ({ beforeAll, beforeEach, loader, nock, assert, it }) => {
	beforeAll(() => bootContainer());

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
			.reply(200, loader.json("test/fixtures/client/wallet-non-resigned.json"))
			.get("/api/wallets/030fde54605c5d53436217a2849d276376d0b0f12c71219cd62b0a4539e1e75acd")
			.reply(200, loader.json("test/fixtures/client/wallet-non-resigned.json"))

			// second wallet
			.get("/api/wallets/DNc92FQmYu8G9Xvo6YqhPtRxYsUxdsUn9w")
			.reply(200, loader.json("test/fixtures/client/wallet-2.json"))
			.get("/api/wallets/022e04844a0f02b1df78dff2c7c4e3200137dfc1183dcee8fc2a411b00fd1877ce")
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

		const profileRepository = container.get(Identifiers.ProfileRepository);
		profileRepository.flush();

		context.profile = await profileRepository.create("John Doe");

		context.subject = await context.profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: identity.mnemonic,
			network: "ark.devnet",
		});
	});

	it("should return current votes", async (context) => {
		assert.throws(
			() => context.subject.voting().available(),
			"The voting data has not been synced. Please call [synchroniser().votes()] before accessing votes.",
		);

		await container.get(Identifiers.DelegateService).sync(context.profile, "ARK", "ark.devnet");
		await context.subject.synchroniser().votes();

		assert.length(context.subject.voting().current(), 1);
		assert.is(context.subject.voting().current()[0].wallet?.address(), "DSyG9hK9CE8eyfddUoEvsga4kNVQLdw2ve");
		assert.is(context.subject.voting().current()[0].wallet?.username(), "alessio");
	});

	it("should return votes available", (context) => {
		assert.throws(
			() => context.subject.voting().available(),
			"The voting data has not been synced. Please call [synchroniser().votes()] before accessing votes.",
		);

		context.subject.data().set(WalletData.VotesAvailable, 2);

		assert.is(context.subject.voting().available(), 2);
	});

	it("should return votes used", (context) => {
		assert.throws(
			() => context.subject.voting().used(),
			"The voting data has not been synced. Please call [synchroniser().votes()] before accessing votes.",
		);

		context.subject.data().set(WalletData.VotesUsed, 2);

		assert.is(context.subject.voting().used(), 2);
	});
});
