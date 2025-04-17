import { describeWithContext } from "@ardenthq/sdk-test";

import { identity } from "../test/fixtures/identity";
import { bootContainer, importByMnemonic } from "../test/mocking";
import { NotificationRepository } from "./notification.repository";
import { INotificationTypes } from "./notification.repository.contract";
import { ProfileTransactionNotificationService } from "./notification.transactions.service.js";
import { Profile } from "./profile";
import { ProfileSetting } from "./profile.enum.contract";
import { ExtendedConfirmedTransactionData } from "./transaction.dto.js";

describeWithContext(
	"ProfileTransactionNotificationService",
	{ mnemonic: identity.mnemonic },
	({ beforeEach, it, assert, loader, nock, stub }) => {
		beforeEach(async (context) => {
			bootContainer();

			nock.fake()
				.get("/api/node/configuration/crypto")
				.reply(200, loader.json("test/fixtures/client/cryptoConfiguration.json"))
				.get("/api/node/configuration")
				.reply(200, loader.json("test/fixtures/client/configuration.json"))
				.get("/api/peers")
				.reply(200, loader.json("test/fixtures/client/peers.json"))
				.get("/api/node/syncing")
				.reply(200, loader.json("test/fixtures/client/syncing.json"))
				.get("/api/wallets", {})
				.query({ limit: 1, nonce: 0 })
				.reply(200, {})
				.get("/api/wallets/D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW")
				.reply(200, loader.json("test/fixtures/client/wallet.json"))
				.persist();

			context.profile = new Profile({ avatar: "avatar", data: "", id: "uuid", name: "name" });
			await importByMnemonic(context.profile, context.mnemonic, "ARK", "ark.devnet");

			context.notificationsRepository = new NotificationRepository(context.profile);
			context.subject = new ProfileTransactionNotificationService(
				context.profile,
				context.notificationsRepository,
			);

			context.notificationTransactionFixtures = loader.json(
				"test/fixtures/client/notification-transactions.json",
			);
			context.includedTransactionNotificationId = context.notificationTransactionFixtures.data[1].id;
			context.excludedTransactionNotificationId = context.notificationTransactionFixtures.data[3].id;
		});

		it("#recent", async (context) => {
			nock.fake().get("/api/transactions").query(true).reply(200, context.notificationTransactionFixtures);

			await context.subject.sync({ limit: 20 });

			assert.length(context.subject.recent(), 2);
			assert.length(context.subject.recent(10), 2);

			await context.subject.sync();
			assert.length(context.subject.recent(1), 1);
		});

		it("#sync", async (context) => {
			nock.fake().get("/api/transactions").query(true).reply(200, context.notificationTransactionFixtures);

			context.profile.settings().set(ProfileSetting.UseTestNetworks, true);

			await context.subject.sync({ limit: 10 });

			assert.length(context.subject.transactions(), 2);
			assert.false(context.subject.has(context.excludedTransactionNotificationId));
			assert.true(context.subject.has(context.includedTransactionNotificationId));
		});

		it("should return empty responses for test networks", async (context) => {
			nock.fake()
				.get("/api/transactions")
				.query(true)
				.reply(200, loader.json("test/fixtures/client/transactions-empty.json"));

			context.profile.settings().set(ProfileSetting.UseTestNetworks, false);

			await context.subject.sync();

			assert.length(context.subject.transactions(), 0);
			assert.false(context.subject.has(context.excludedTransactionNotificationId));
			assert.false(context.subject.has(context.includedTransactionNotificationId));
		});

		it("#has", async (context) => {
			nock.fake().get("/api/transactions").query(true).reply(200, context.notificationTransactionFixtures);

			await context.subject.sync();

			assert.false(context.subject.has(context.excludedTransactionNotificationId));
			assert.true(context.subject.has(context.includedTransactionNotificationId));
		});

		it("#findByTransactionId", async (context) => {
			nock.fake().get("/api/transactions").query(true).reply(200, context.notificationTransactionFixtures);

			await context.subject.sync();

			assert.truthy(context.subject.findByTransactionId(context.includedTransactionNotificationId));
			assert.undefined(context.subject.findByTransactionId("unknown"));
		});

		it("#forget", async (context) => {
			nock.fake().get("/api/transactions").query(true).reply(200, context.notificationTransactionFixtures);

			await context.subject.sync();

			assert.truthy(context.subject.findByTransactionId(context.includedTransactionNotificationId));

			context.subject.forget("unknown");
			context.subject.forget(context.includedTransactionNotificationId);

			assert.undefined(context.subject.findByTransactionId(context.includedTransactionNotificationId));
		});

		it("#forgetByRecipient", async (context) => {
			nock.fake()
				.get("/api/transactions")
				.query(true)
				.reply(200, context.notificationTransactionFixtures)
				.persist();

			await context.subject.sync({ limit: 20 });
			const wallet = context.profile.wallets().first();
			assert.true(context.subject.has(context.includedTransactionNotificationId));
			assert.length(context.subject.transactions(), 2);

			context.subject.forgetByRecipient("unknown");

			assert.true(context.subject.has(context.includedTransactionNotificationId));

			context.subject.forgetByRecipient(wallet.address());

			assert.false(context.subject.has(context.includedTransactionNotificationId));
			assert.length(context.subject.transactions(), 0);
		});

		it("#markAsRead", async (context) => {
			nock.fake().get("/api/transactions").query(true).reply(200, context.notificationTransactionFixtures);

			await context.subject.sync({ limit: 20 });

			const notification = context.subject.findByTransactionId(context.includedTransactionNotificationId);
			assert.undefined(notification?.read_at);

			context.subject.markAsRead("unknown");
			context.subject.markAsRead(context.includedTransactionNotificationId);

			assert.truthy(context.subject.findByTransactionId(context.includedTransactionNotificationId)?.read_at);
		});

		it("#transactions", async (context) => {
			nock.fake().get("/api/transactions").query(true).reply(200, context.notificationTransactionFixtures);

			await context.subject.sync({ limit: 20 });

			assert.length(context.subject.transactions(), 2);
			assert.length(context.subject.transactions(1), 1);
		});

		it("#transactions", async (context) => {
			nock.fake().get("/api/transactions").query(true).reply(200, context.notificationTransactionFixtures);

			await context.subject.sync({ limit: 20 });

			assert.instance(
				context.subject.transaction(context.includedTransactionNotificationId),
				ExtendedConfirmedTransactionData,
			);
		});

		it("should handle undefined timestamp", async (context) => {
			nock.fake().get("/api/transactions").query(true).reply(200, context.notificationTransactionFixtures);

			const transactions = await context.profile.transactionAggregate().received({ limit: 10 });
			const transaction = transactions.findById(context.notificationTransactionFixtures.data[2].id);

			stub(transaction, "timestamp").returnValue();
			stub(context.profile.transactionAggregate(), "received").resolvedValue(transactions);

			await context.subject.sync();
			assert.length(context.subject.recent(10), 2);
			assert.length(context.subject.recent(), 2);
			assert.length(context.subject.transactions(), 2);

			// jest.restoreAllMocks();

			await context.subject.sync();
			assert.length(context.subject.recent(10), 2);
			assert.length(context.subject.recent(), 2);
		});

		it("#markAllAsRead", async (context) => {
			nock.fake().get("/api/transactions").query(true).reply(200, context.notificationTransactionFixtures);

			await context.subject.sync({ limit: 20 });
			context.notificationsRepository.push({
				meta: { version: "3.0.0" },
				type: INotificationTypes.Release,
			});

			assert.length(context.notificationsRepository.unread(), 3);
			assert.length(context.subject.recent(), 2);
			context.subject.markAllAsRead();
			assert.length(context.notificationsRepository.unread(), 1);
		});

		it("#isSyncing", async (context) => {
			nock.fake().get("/api/transactions").query(true).reply(200, context.notificationTransactionFixtures);

			assert.false(context.subject.isSyncing());
			await context.subject.sync({ limit: 20 });
		});
	},
);
