import { Selector } from "testcafe";

import { cucumber, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../e2e/common";

const notifications = Selector("[data-testid=NavigationBar__buttons--notifications]");

const preSteps = {
	"Given Alice is signed into her profile": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
	},
};
cucumber(
	"@notifications-openNotifications",
	{
		...preSteps,
		"When she opens her notifications": async (t: TestController) => {
			await t.expect(notifications.exists).ok();
			await t.click(notifications);
		},
		"Then the notification list is displayed": async (t: TestController) => {
			await t.expect(Selector("[data-testid=NotificationsWrapper]").exists).ok();
			await t.expect(Selector("[data-testid=NotificationItem]").count).eql(1);
			await t.expect(Selector("[data-testid=TransactionTable]").exists).ok();
			await t.hover(Selector("[data-testid=TransactionTable]"));
			await t.expect(Selector("[data-testid=NotificationsWrapper] [data-testid=TableRow]").count).gt(0);
		},
	},
	[
		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?page=1&limit=12&address=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
			"coins/ark/devnet/transactions/byAddress/D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD-1-10",
		),
		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?page=1&limit=12&address=D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
			"coins/ark/devnet/transactions/byAddress/D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb-1-10",
		),
	],
);
cucumber(
	"@notifications-transactionDetail",
	{
		...preSteps,
		"When she opens her notifications": async (t: TestController) => {
			await t.expect(notifications.exists).ok();
			await t.click(notifications);
		},
		"And selects a transaction": async (t: TestController) => {
			await t.expect(Selector("[data-testid=TransactionTable]").exists).ok();
			await t.hover(Selector("[data-testid=TransactionTable]"));
			await t.expect(Selector("[data-testid=NotificationsWrapper] [data-testid=TableRow]").count).gt(0);
			await t.click(Selector("[data-testid=NotificationsWrapper] [data-testid=TableRow]:first-child"));
		},
		"Then the transaction details modal is displayed": async (t: TestController) => {
			await t.expect(Selector("[data-testid=Modal__inner]").exists).ok();
		},
		"When she selects close on the transaction details modal": async (t: TestController) => {
			await t.click(Selector("[data-testid=Modal__close-button]"));
		},
		"Then the modal is no longer displayed": async (t: TestController) => {
			await t.expect(Selector("[data-testid=Modal__inner]").exists).notOk();
		},
	},
	[
		mockRequest(
			"https://ark-test.arkvault.io/api/blocks/e6d4760c50419d8665731d3391ba209767f3073d4b2b6661078ff220034d197e",
			{
				"data": {
					"id": "e6d4760c50419d8665731d3391ba209767f3073d4b2b6661078ff220034d197e",
					"version": 0,
					"height": 19362468,
					"previous": "ee54abc37bac91358cbcdfe725347268bd6ee1c5f0b3a48b3ba3025ee7cfca11",
					"forged": {
						"reward": "200000000",
						"fee": "6206028",
						"amount": "100000",
						"total": "206206028"
					},
					"payload": {
						"hash": "2cf134885471ae6c9ea44f43a7b5f8a1ab78078cd102615d56344f6a43a1ff6f",
						"length": 32
					},
					"generator": {
						"username": "genesis_27",
						"address": "DKY5eyQUKKYyaCfPp6MUv3Y4FW6EbNF53A",
						"publicKey": "03508436f55577f406be58a5e7e59307cea823943c5312d62f4e3f3c63966f6e7c"
					},
					"signature": "30450221009b5d4312dc7e2169aa36c35ef33e95fc02d9033faeef822e4e2ef60e53f5609802207614d9a9d2442a426fe01d505b4546c3d8f6e9581d263d873c41c673e4e8f92a",
					"confirmations": 28467,
					"transactions": 1,
					"timestamp": {
						"epoch": 236656104,
						"unix": 1726757304,
						"human": "2024-09-19T14:48:24.000Z"
					}
				}
			}
		),
		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?page=1&limit=12&address=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
			"coins/ark/devnet/transactions/byAddress/D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD-1-10",
		),
		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?page=1&limit=12&address=D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
			"coins/ark/devnet/transactions/byAddress/D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb-1-10",
		),
	],
);
cucumber(
	"@notifications-redDotUnread",
	{
		"Given Alice signs into a profile with unread notifications": async (t: TestController) => {
			await visitWelcomeScreen(t);
			await goToProfile(t);
		},
		"Then a red dot should be present on the notifications icon": async (t: TestController) => {
			await t.expect(Selector("[data-testid=NavigationBar__buttons--notifications] .rounded-full").exists).ok();
		},
	},
	[
		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?page=1&limit=12&address=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
			"coins/ark/devnet/transactions/byAddress/D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD-1-10",
		),
		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?page=1&limit=12&address=D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
			"coins/ark/devnet/transactions/byAddress/D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb-1-10",
		),
	],
);

cucumber(
	"@notifications-markAsRead",
	{
		"Given Alice signs into a profile with unread notifications": async (t: TestController) => {
			await visitWelcomeScreen(t);
			await goToProfile(t);
		},
		"Then a red dot should be present on the notifications icon": async (t: TestController) => {
			await t.expect(Selector("[data-testid=NavigationBar__buttons--notifications] .rounded-full").exists).ok();
		},
		"When she opens her notifications": async (t: TestController) => {
			await t.expect(notifications.exists).ok();
			await t.click(notifications);
		},
		"Then the notifications are marked as read": async (t: TestController) => {
			await t.expect(Selector("[data-testid=NotificationsWrapper] [data-testid=TableRow]").count).eql(3);
		},
		"And the red dot is hidden": async (t: TestController) => {
			await t.hover(Selector("[data-testid=NotificationItem]"));
			await t
				.expect(Selector("[data-testid=NavigationBar__buttons--notifications] .rounded-full").exists)
				.notOk();
		},
	},
	[
		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?page=1&limit=12&address=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
			"coins/ark/devnet/transactions/byAddress/D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD-1-10",
		),
		mockRequest(
			"https://ark-test.arkvault.io/api/transactions?page=1&limit=12&address=D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
			"coins/ark/devnet/transactions/byAddress/D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb-1-10",
		),
	],
);
