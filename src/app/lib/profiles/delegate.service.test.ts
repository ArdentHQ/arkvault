import { describeWithContext } from "@ardenthq/sdk-test";

import { identity } from "../test/fixtures/identity";
import { bootContainer } from "../test/mocking";
import { DelegateService } from "./delegate.service.js";
import { Profile } from "./profile";

describeWithContext(
	"DelegateService",
	{ mnemonic: identity.mnemonic },
	({ beforeEach, it, assert, loader, nock, stub }) => {
		beforeEach(async (context) => {
			bootContainer();

			nock.fake()
				.get("/api/node/configuration")
				.reply(200, loader.json("test/fixtures/client/configuration.json"))
				.get("/api/node/configuration/crypto")
				.reply(200, loader.json("test/fixtures/client/cryptoConfiguration.json"))
				.get("/api/node/syncing")
				.reply(200, loader.json("test/fixtures/client/syncing.json"))
				.persist();

			context.profile = new Profile({ avatar: "avatar", data: "", id: "profile-id", name: "name" });
			context.subject = new DelegateService();

			context.wallet = await context.profile.walletFactory().fromMnemonicWithBIP39({
				coin: "ARK",
				mnemonic: context.mnemonic,
				network: "ark.devnet",
			});
		});

		it("should sync the delegates", async (context) => {
			nock.fake()
				.get("/api/delegates")
				.reply(200, loader.json("test/fixtures/client/delegates-1.json"))
				.get("/api/delegates?page=2")
				.reply(200, loader.json("test/fixtures/client/delegates-2.json"));

			assert.throws(() => context.subject.all("ARK", "ark.devnet"), "have not been synchronized yet");

			await context.subject.sync(context.profile, "ARK", "ark.devnet");

			assert.array(context.subject.all("ARK", "ark.devnet"));
			assert.length(context.subject.all("ARK", "ark.devnet"), 200);
		});

		it("should sync the delegates only one page", async (context) => {
			nock.fake()
				.get("/api/delegates")
				.reply(200, loader.json("test/fixtures/client/delegates-single-page.json"));

			assert.throws(() => context.subject.all("ARK", "ark.devnet"), "have not been synchronized yet");

			await context.subject.sync(context.profile, "ARK", "ark.devnet");

			assert.array(context.subject.all("ARK", "ark.devnet"));
			assert.length(context.subject.all("ARK", "ark.devnet"), 10);
		});

		it("should sync the delegates when network does not support FastDelegateSync", async (context) => {
			nock.fake()
				.get("/api/delegates")
				.reply(200, loader.json("test/fixtures/client/delegates-1.json"))
				.get("/api/delegates?page=2")
				.reply(200, loader.json("test/fixtures/client/delegates-2.json"));

			assert.throws(() => context.subject.all("ARK", "ark.devnet"), "have not been synchronized yet");

			stub(context.profile.coins().set("ARK", "ark.devnet").network(), "meta").returnValue({
				fastDelegateSync: false,
			});

			await context.subject.sync(context.profile, "ARK", "ark.devnet");

			assert.array(context.subject.all("ARK", "ark.devnet"));
			assert.length(context.subject.all("ARK", "ark.devnet"), 200);
		});

		it("should sync the delegates of all coins", async (context) => {
			nock.fake()
				.get("/api/delegates")
				.reply(200, loader.json("test/fixtures/client/delegates-1.json"))
				.get("/api/delegates?page=2")
				.reply(200, loader.json("test/fixtures/client/delegates-2.json"));

			assert.throws(() => context.subject.all("ARK", "ark.devnet"), "have not been synchronized yet");

			await context.subject.syncAll(context.profile);

			assert.array(context.subject.all("ARK", "ark.devnet"));
			assert.length(context.subject.all("ARK", "ark.devnet"), 200);
		});

		it("should find a delegate by address or throw error if not found", async (context) => {
			nock.fake()
				.get("/api/delegates")
				.reply(200, loader.json("test/fixtures/client/delegates-1.json"))
				.get("/api/delegates?page=2")
				.reply(200, loader.json("test/fixtures/client/delegates-2.json"));

			await context.subject.syncAll(context.profile);

			assert.truthy(context.subject.findByAddress("ARK", "ark.devnet", "DSyG9hK9CE8eyfddUoEvsga4kNVQLdw2ve"));
			assert.throws(() => context.subject.findByAddress("ARK", "ark.devnet", "unknown"), /No delegate for/);
		});

		it("should find a delegate by public key or throw error if not found", async (context) => {
			nock.fake()
				.get("/api/delegates")
				.reply(200, loader.json("test/fixtures/client/delegates-1.json"))
				.get("/api/delegates?page=2")
				.reply(200, loader.json("test/fixtures/client/delegates-2.json"));

			await context.subject.syncAll(context.profile);

			assert.truthy(
				context.subject.findByPublicKey(
					"ARK",
					"ark.devnet",
					"033a5474f68f92f254691e93c06a2f22efaf7d66b543a53efcece021819653a200",
				),
			);
			assert.throws(() => context.subject.findByPublicKey("ARK", "ark.devnet", "unknown"), /No delegate for/);
		});

		it("should find a delegate by username or throw error if not found", async (context) => {
			nock.fake()
				.get("/api/delegates")
				.reply(200, loader.json("test/fixtures/client/delegates-1.json"))
				.get("/api/delegates?page=2")
				.reply(200, loader.json("test/fixtures/client/delegates-2.json"));

			await context.subject.syncAll(context.profile);

			assert.truthy(context.subject.findByUsername("ARK", "ark.devnet", "alessio"));
			assert.throws(() => context.subject.findByUsername("ARK", "ark.devnet", "unknown"), /No delegate for/);
		});

		it("should return an empty array if there are no public keys", async (context) => {
			const mappedDelegates = context.subject.map(context.wallet, []);

			assert.array(mappedDelegates);
			assert.length(mappedDelegates, 0);
		});

		it("should map the public keys to read-only wallets", async (context) => {
			nock.fake()
				.get("/api/delegates")
				.reply(200, loader.json("test/fixtures/client/delegates-1.json"))
				.get("/api/delegates?page=2")
				.reply(200, loader.json("test/fixtures/client/delegates-2.json"));

			const delegates = loader.json("test/fixtures/client/delegates-1.json").data;
			const addresses = delegates.map((delegate) => delegate.address);
			const publicKeys = delegates.map((delegate) => delegate.publicKey);
			const usernames = delegates.map((delegate) => delegate.username);

			await context.subject.sync(context.profile, context.wallet.coinId(), context.wallet.networkId());

			const mappedDelegates = context.subject.map(context.wallet, publicKeys);

			assert.array(mappedDelegates);
			assert.length(mappedDelegates, 100);

			for (let index = 0; index < delegates.length; index++) {
				assert.is(mappedDelegates[index].address(), addresses[index]);
				assert.is(mappedDelegates[index].publicKey(), publicKeys[index]);
				assert.is(mappedDelegates[index].username(), usernames[index]);
			}
		});

		it("should skip public keys for which it does not find a delegate", async (context) => {
			nock.fake()
				.get("/api/delegates")
				.reply(200, loader.json("test/fixtures/client/delegates-1.json"))
				.get("/api/delegates?page=2")
				.reply(200, loader.json("test/fixtures/client/delegates-2.json"));

			const delegates = loader.json("test/fixtures/client/delegates-1.json").data;
			const addresses = delegates.map((delegate) => delegate.address);
			const publicKeys = delegates.map((delegate) => delegate.publicKey);
			const usernames = delegates.map((delegate) => delegate.username);

			await context.subject.sync(context.profile, context.wallet.coinId(), context.wallet.networkId());

			const mappedDelegates = context.subject.map(context.wallet, [...publicKeys, "pubkey"]);

			assert.array(mappedDelegates);
			assert.length(mappedDelegates, 100);

			for (let index = 0; index < delegates.length; index++) {
				assert.is(mappedDelegates[index].address(), addresses[index]);
				assert.is(mappedDelegates[index].publicKey(), publicKeys[index]);
				assert.is(mappedDelegates[index].username(), usernames[index]);
			}
		});
	},
);
