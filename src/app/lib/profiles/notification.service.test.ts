import { describeWithContext } from "@ardenthq/sdk-test";

import { identity } from "../test/fixtures/identity";
import { bootContainer, importByMnemonic } from "../test/mocking";
import { WalletReleaseNotificationService } from "./notification.releases.service.js";
import { INotificationTypes } from "./notification.repository.contract";
import { ProfileNotificationService } from "./notification.service.js";
import { ProfileTransactionNotificationService } from "./notification.transactions.service.js";
import { Profile } from "./profile";

describeWithContext(
	"NotificationService",
	{ mnemonic: identity.mnemonic },
	({ it, assert, loader, beforeEach, nock }) => {
		beforeEach(async (context) => {
			bootContainer();

			context.notificationTransactionFixtures = loader.json(
				"test/fixtures/client/notification-transactions.json",
			);

			nock.fake()
				.get("/api/node/configuration")
				.reply(200, loader.json("test/fixtures/client/configuration.json"))
				.get("/api/node/configuration/crypto")
				.reply(200, loader.json("test/fixtures/client/cryptoConfiguration.json"))
				.get("/api/node/syncing")
				.reply(200, loader.json("test/fixtures/client/syncing.json"))
				.get("/api/peers")
				.reply(200, loader.json("test/fixtures/client/peers.json"))
				.get("/api/wallets", {})
				.query({ limit: 1, nonce: 0 })
				.reply(200, {})
				.get("/api/wallets/D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW")
				.reply(200, loader.json("test/fixtures/client/wallet.json"))
				.get("/api/transactions")
				.query(true)
				.reply(200, context.notificationTransactionFixtures)
				.persist();

			const profile = new Profile({ avatar: "avatar", data: "", id: "uuid", name: "name" });
			await importByMnemonic(profile, context.mnemonic, "ARK", "ark.devnet");

			context.subject = new ProfileNotificationService(profile);
		});

		it("#transactions", async (context) => {
			assert.instance(context.subject.transactions(), ProfileTransactionNotificationService);
		});

		it("#releases", async (context) => {
			assert.instance(context.subject.releases(), WalletReleaseNotificationService);
		});

		it("#markAsRead", async (context) => {
			assert.false(context.subject.hasUnread());
			await context.subject.transactions().sync({});

			assert.true(context.subject.hasUnread());

			const notification = context.subject
				.transactions()
				.findByTransactionId(context.notificationTransactionFixtures.data[1].id);
			context.subject.markAsRead(notification?.id);

			const notification2 = context.subject
				.transactions()
				.findByTransactionId(context.notificationTransactionFixtures.data[2].id);
			context.subject.markAsRead(notification2?.id);

			assert.false(context.subject.hasUnread());
		});

		it("#get", async (context) => {
			assert.false(context.subject.hasUnread());
			await context.subject.transactions().sync({});

			const notification = context.subject
				.transactions()
				.findByTransactionId(context.notificationTransactionFixtures.data[1].id);

			assert.is(context.subject.get(notification?.id).meta, notification?.meta);
		});

		it("#filterByType", async (context) => {
			await context.subject.transactions().sync({});

			assert.length(context.subject.filterByType(INotificationTypes.Transaction), 2);
		});

		it("#hasUnread", async (context) => {
			assert.false(context.subject.hasUnread());
			await context.subject.transactions().sync({});
			assert.true(context.subject.hasUnread());
		});

		it("#all", async (context) => {
			await context.subject.transactions().sync({});
			assert.instance(context.subject.all(), Object);
			assert.length(Object.values(context.subject.all()), 2);
		});

		it("#count", async (context) => {
			await context.subject.transactions().sync({});
			assert.is(context.subject.count(), 2);
		});

		it("#flush", async (context) => {
			await context.subject.transactions().sync({});
			assert.is(context.subject.count(), 2);
			context.subject.flush();
			assert.is(context.subject.count(), 0);
		});

		it("#fill", async (context) => {
			const notifications = {
				"46530491-0056-4239-ae12-1b406ba7f68d": {
					id: "46530491-0056-4239-ae12-1b406ba7f68d",
					meta: {
						timestamp: 1_584_871_208,
						transactionId: "9049c49eb0e0d9b14becc38d4f51ab993aa9fc7f6a7b23a1aff9e7bc060d2bb1",
					},
					read_at: undefined,
					type: "transaction",
				},
			};

			assert.is(context.subject.count(), 0);
			context.subject.fill(notifications);
			assert.is(context.subject.count(), 1);
		});
	},
);
