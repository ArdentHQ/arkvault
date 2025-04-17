import { describeWithContext } from "@ardenthq/sdk-test";

import { bootContainer } from "../test/mocking";
import { NotificationRepository } from "./notification.repository";
import { INotificationTypes } from "./notification.repository.contract";
import { Profile } from "./profile";

describeWithContext(
	"NotificationRepository",
	{
		releaseNotifications: [
			{
				body: "...",
				icon: "warning",
				meta: {
					version: "3.0.0",
				},
				name: "Wallet Update Available",
				type: INotificationTypes.Release,
			},
		],
		stubNotification: {
			action: "Read Changelog",
			body: "...",
			icon: "warning",
			name: "Ledger Update Available",
			type: "ledger",
		},
		stubNotifications: [
			{
				action: "Read Changelog",
				body: "...",
				icon: "warning",
				name: "Ledger Update Available",
				type: "ledger",
			},
			{
				action: "Read Changelog",
				body: "...",
				icon: "warning",
				name: "Ledger Update Available",
				type: "plugin",
			},
			{
				action: "open",
				body: "...",
				icon: "info",
				meta: {
					txId: "1",
				},
				name: "Transaction Created",
				type: "transaction",
			},
		],
		transactionNotifications: [
			{
				meta: {
					transactionId: "1",
				},
				type: INotificationTypes.Transaction,
			},
			{
				meta: {
					transactionId: "2",
				},
				type: INotificationTypes.Transaction,
			},
			{
				meta: {
					transactionId: "3",
				},
				type: INotificationTypes.Transaction,
			},
		],
	},
	({ beforeEach, assert, it, nock, loader }) => {
		beforeEach((context) => {
			bootContainer();

			context.subject = new NotificationRepository(
				new Profile({ avatar: "avatar", data: "", id: "uuid", name: "name" }),
			);
		});

		it("#all", (context) => {
			assert.length(context.subject.keys(), 0);

			for (const n of context.stubNotifications) {
				context.subject.push(n);
			}
			assert.length(Object.keys(context.subject.all()), context.stubNotifications.length);
		});

		it("#first", (context) => {
			assert.length(context.subject.keys(), 0);

			for (const n of context.stubNotifications) {
				context.subject.push(n);
			}

			assert.length(context.subject.keys(), context.stubNotifications.length);
			assert.is(context.subject.first().name, context.stubNotification.name);
		});

		it("#last", (context) => {
			assert.length(context.subject.keys(), 0);

			for (const n of context.stubNotifications) {
				context.subject.push(n);
			}

			assert.length(context.subject.keys(), context.stubNotifications.length);
			assert.is(context.subject.last().name, context.stubNotifications.at(-1).name);
		});

		it("#keys", (context) => {
			assert.length(context.subject.keys(), 0);

			for (const n of context.stubNotifications) {
				context.subject.push(n);
			}
			const keys = Object.keys(context.subject.all());

			assert.equal(context.subject.keys(), keys);
		});

		it("#values", (context) => {
			assert.length(context.subject.keys(), 0);

			for (const n of context.stubNotifications) {
				context.subject.push(n);
			}
			const values = Object.keys(context.subject.all()).map((id) => context.subject.get(id));

			assert.equal(context.subject.values(), values);
		});

		it("#get", (context) => {
			assert.throws(() => context.subject.get("invalid"), "Failed to find");

			const notification = context.subject.push(context.stubNotification);

			assert.object(context.subject.get(notification.id));
		});

		it("#push", (context) => {
			assert.length(context.subject.keys(), 0);

			context.subject.push(context.stubNotification);

			assert.length(context.subject.keys(), 1);

			context.subject.push(context.stubNotification);

			assert.length(context.subject.keys(), 2);
		});

		it("#fill", (context) => {
			assert.length(context.subject.keys(), 0);

			for (const n of context.stubNotifications) {
				context.subject.push(n);
			}
			const first = context.subject.first();
			context.subject.fill(Object.assign(first, { name: "updated name" }));

			assert.is(context.subject.first().name, "updated name");
		});

		it("#has", (context) => {
			const notification = context.subject.push(context.stubNotification);

			assert.true(context.subject.has(notification.id));

			context.subject.forget(notification.id);

			assert.false(context.subject.has(notification.id));
		});

		it("#forget", (context) => {
			assert.throws(() => context.subject.forget("invalid"), "Failed to find");

			const notification = context.subject.push(context.stubNotification);

			context.subject.forget(notification.id);

			assert.throws(() => context.subject.get(notification.id), "Failed to find");
		});

		it("#flush", (context) => {
			context.subject.push(context.stubNotification);

			assert.length(context.subject.keys(), 1);

			context.subject.flush();

			assert.length(context.subject.keys(), 0);
		});

		it("#count", (context) => {
			assert.length(context.subject.keys(), 0);

			for (const n of context.stubNotifications) {
				context.subject.push(n);
			}

			assert.is(context.subject.count(), context.stubNotifications.length);
		});

		it("marks notifications as read and filters them", (context) => {
			context.subject.push(context.stubNotification);
			context.subject.markAsRead(context.subject.push(context.stubNotification).id);

			assert.length(context.subject.read(), 1);
			assert.length(context.subject.unread(), 1);
		});

		it("#read", (context) => {
			assert.length(context.subject.keys(), 0);

			for (const n of context.stubNotifications) {
				context.subject.push(n);
			}
			context.subject.markAsRead(context.subject.first().id);

			assert.length(context.subject.unread(), 2);
			assert.truthy(context.subject.first().read_at);
		});

		it("#unread", (context) => {
			assert.length(context.subject.keys(), 0);

			for (const n of context.stubNotifications) {
				context.subject.push(n);
			}
			context.subject.markAsRead(context.subject.first().id);

			assert.length(context.subject.unread(), 2);
			assert.truthy(context.subject.first().read_at);

			assert.undefined(context.subject.last().read_at);
		});

		it("#filterByType", (context) => {
			assert.length(context.subject.keys(), 0);

			for (const n of context.transactionNotifications) {
				context.subject.push(n);
			}
			for (const n of context.releaseNotifications) {
				context.subject.push(n);
			}

			assert.length(context.subject.filterByType(INotificationTypes.Release), 1);
			assert.length(context.subject.filterByType(INotificationTypes.Transaction), 3);
		});

		it("#findByTransactionId", (context) => {
			assert.length(context.subject.keys(), 0);

			assert.undefined(context.subject.findByTransactionId("1")?.meta?.transactionId);

			for (const n of context.transactionNotifications) {
				context.subject.push(n);
			}

			assert.is(
				context.subject.findByTransactionId("1")?.meta?.transactionId,
				context.transactionNotifications[0]?.meta.transactionId,
			);
			assert.undefined(context.subject.findByTransactionId("10")?.meta?.transactionId);

			context.subject.push({
				type: INotificationTypes.Transaction,
			});

			assert.length(context.subject.filterByType(INotificationTypes.Transaction), 4);
			assert.undefined(context.subject.findByTransactionId("100")?.meta?.transactionId);
		});

		it("#findByVersion", (context) => {
			assert.length(context.subject.keys(), 0);

			assert.undefined(context.subject.findByVersion("3.0.0")?.meta?.version);

			for (const n of context.releaseNotifications) {
				context.subject.push(n);
			}

			context.subject.push({
				type: INotificationTypes.Release,
			});

			assert.is(
				context.subject.findByVersion("3.0.0")?.meta?.version,
				context.releaseNotifications[0]?.meta.version,
			);
			assert.undefined(context.subject.findByVersion("3.0.1")?.meta?.version);
		});

		it("should have meta info", (context) => {
			assert.length(context.subject.keys(), 0);

			for (const n of context.stubNotifications) {
				context.subject.push(n);
			}

			const last = context.stubNotifications.at(-1);
			assert.object(context.subject.last().meta);
			assert.is(context.subject.last().meta, last.meta);
		});

		it("should have a type", (context) => {
			assert.length(context.subject.keys(), 0);

			for (const n of context.stubNotifications) {
				context.subject.push(n);
			}

			const last = context.stubNotifications.at(-1);
			assert.is(context.subject.last().type, last.type);
		});
	},
);
