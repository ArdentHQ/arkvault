import { describeWithContext } from "@ardenthq/sdk-test";

import { identity } from "../test/fixtures/identity";
import { bootContainer, importByMnemonic } from "../test/mocking";
import { container } from "./container";
import { Identifiers } from "./container.models";
import { WalletData } from "./contracts";

describeWithContext(
	"Portfolio",
	{
		mnemonic: identity.mnemonic,
	},
	({ beforeEach, nock, it, assert, loader, stub }) => {
		beforeEach(async (context) => {
			bootContainer();

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
				.get("/api/wallets/D94iLJaZSbjXG6XaR9BGRVBfzzYmxNt1Bi")
				.reply(200, loader.json("test/fixtures/client/wallet.json"))
				.get("/api/wallets/DTShJdDKECzQLW3uomKfuPvmU51sxyNWUL")
				.reply(200, loader.json("test/fixtures/client/wallet.json"))
				.get("/api/wallets/DQzosAzwyYStw2bUeUTCUnqiMonEz9ER2o")
				.reply(200, loader.json("test/fixtures/client/wallet.json"))
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
				mnemonic: context.mnemonic,
				network: "ark.devnet",
			});
		});

		it("should aggregate the balances of all wallets", async (context) => {
			nock.fake()
				.get("/data/dayAvg")
				.query(true)
				.reply(200, { BTC: 0.000_050_48, ConversionType: { conversionSymbol: "", type: "direct" } })
				.persist();

			const [a, b, c] = await Promise.all([
				importByMnemonic(
					context.profile,
					"bomb open frame quit success evolve gain donate prison very rent later",
					"ARK",
					"ark.devnet",
				),
				importByMnemonic(
					context.profile,
					"dizzy feel dinosaur one custom excuse mutual announce shrug stamp rose arctic",
					"ARK",
					"ark.devnet",
				),
				importByMnemonic(
					context.profile,
					"citizen door athlete item name various drive onion foster audit board myself",
					"ARK",
					"ark.devnet",
				),
			]);

			a.data().set(WalletData.Balance, { fees: 1e8, total: 1e8 });
			b.data().set(WalletData.Balance, { fees: 1e8, total: 1e8 });
			c.data().set(WalletData.Balance, { fees: 1e8, total: 1e8 });

			stub(a.network(), "isLive").returnValue(true);
			stub(a.network(), "isTest").returnValue(false);
			stub(a.network(), "ticker").returnValue("ARK");

			await container.get(Identifiers.ExchangeRateService).syncAll(context.profile, "ARK");

			assert.is(context.profile.portfolio().breakdown()[0].source, 3);
			assert.is(context.profile.portfolio().breakdown()[0].target, 0.000_151_44);
			assert.is(context.profile.portfolio().breakdown()[0].shares, 100);
		});

		it("should ignore test network wallets", async (context) => {
			await Promise.all([
				importByMnemonic(
					context.profile,
					"bomb open frame quit success evolve gain donate prison very rent later",
					"ARK",
					"ark.devnet",
				),
				importByMnemonic(
					context.profile,
					"dizzy feel dinosaur one custom excuse mutual announce shrug stamp rose arctic",
					"ARK",
					"ark.devnet",
				),
				importByMnemonic(
					context.profile,
					"citizen door athlete item name various drive onion foster audit board myself",
					"ARK",
					"ark.devnet",
				),
			]);

			assert.equal(context.profile.portfolio().breakdown(), []);
		});
	},
);
