import { describeWithContext } from "@ardenthq/sdk-test";

import { bootContainer } from "../test/mocking";
import { WalletReleaseNotificationService } from "./notification.releases.service.js";
import { NotificationRepository } from "./notification.repository";
import { INotificationTypes } from "./notification.repository.contract";
import { Profile } from "./profile";

describeWithContext(
	"WalletReleaseNotificationService",
	{
		releaseNotifications: [
			{
				body: "...",
				icon: "warning",
				meta: {
					version: "3.0.2",
				},
				name: "Wallet Update Available 2",
				type: INotificationTypes.Release,
			},
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
	},
	({ beforeEach, it, assert }) => {
		beforeEach((context) => {
			bootContainer();

			context.notificationsRepository = new NotificationRepository(
				new Profile({ avatar: "avatar", data: "", id: "uuid", name: "name" }),
			);

			context.subject = new WalletReleaseNotificationService(context.notificationsRepository);
		});

		it("#push", (context) => {
			for (const notification of context.releaseNotifications) {
				context.subject.push(notification);
			}
			assert.true(context.subject.has("3.0.0"));

			for (const notification of context.releaseNotifications) {
				context.subject.push(notification);
			}
			assert.length(context.notificationsRepository.values(), 2);

			context.subject.push({
				body: "...",
				meta: undefined,
				name: "Wallet Update Available",
			});

			assert.length(context.notificationsRepository.values(), 2);

			context.subject.push({
				body: "...",
				meta: {
					version: undefined,
				},
				name: "Wallet Update Available",
			});

			assert.length(context.notificationsRepository.values(), 2);
		});

		it("#has", (context) => {
			for (const notification of context.releaseNotifications) {
				context.subject.push(notification);
			}
			assert.true(context.subject.has("3.0.0"));
			assert.false(context.subject.has("3.3.0"));
		});

		it("#findByVersion", (context) => {
			for (const notification of context.releaseNotifications) {
				context.subject.push(notification);
			}
			assert.is(context.subject.findByVersion("3.0.0")?.name, context.releaseNotifications[1].name);
			assert.undefined(context.subject.findByVersion("3.10.0"));
		});

		it("#markAsRead", (context) => {
			for (const notification of context.releaseNotifications) {
				context.subject.push(notification);
			}
			const notification = context.subject.findByVersion("3.0.0");
			assert.is(notification?.name, context.releaseNotifications[1].name);
			assert.undefined(notification?.read_at);

			context.subject.markAsRead("3.11.0");
			context.subject.markAsRead("3.0.0");

			assert.truthy(notification?.read_at);
		});

		it("#forget", (context) => {
			for (const notification of context.releaseNotifications) {
				context.subject.push(notification);
			}
			const notification = context.subject.findByVersion("3.0.0");
			assert.is(notification?.name, context.releaseNotifications[1].name);
			assert.undefined(notification?.read_at);

			context.subject.forget("3.11.0");
			context.subject.forget("3.0.0");

			assert.undefined(context.subject.findByVersion("3.0.0"));
		});

		it("#recent", (context) => {
			for (const notification of context.releaseNotifications) {
				context.subject.push(notification);
			}
			assert.length(context.subject.recent(), 2);
			assert.length(context.subject.recent(10), 2);
		});
	},
);
