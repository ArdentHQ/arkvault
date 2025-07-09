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
			await t.expect(Selector("[data-testid=NotificationsWrapper] [data-testid=TableRow]").count).gt(0);
		},
	},
	[
		// mockRequest(
		// 	"https://ark-test.arkvault.io/api/transactions?page=1&limit=12&address=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
		// 	"coins/ark/devnet/transactions/byAddress/D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD-1-10",
		// ),
		// mockRequest(
		// 	"https://ark-test.arkvault.io/api/transactions?page=1&limit=12&address=D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
		// 	"coins/ark/devnet/transactions/byAddress/D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb-1-10",
		// ),
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
			"https://dwallets-evm.mainsailhq.com/api/blocks/1e6789dd661ea8cd38ded6fe818eba181589497a2cc3179c42bb5695c33bcf50",
			{
				data: {
					confirmations: 17870,
					fee: "141733562397000",
					gasUsed: 21000,
					hash: "1e6789dd661ea8cd38ded6fe818eba181589497a2cc3179c42bb5695c33bcf50",
					number: 21767940,
					parentHash: "420663de74f14cdd4a6777bd17f46fbe28ea28e7bb57d920ee818b4ec644b0f1",
					payloadSize: 120,
					proposer: "0x437A38B4770aDB4A097cbfDdCa9C14F05a000065",
					publicKey: "02637b15aa50fa95018609a6d7b52b025de807a41b79b164626cee87dd6f61a662",
					reward: "2000000000000000000",
					round: 0,
					signature:
						"84cff78038b5c70c61b138f7e577d36b3287ac5545170021a217b2b4ca5e3855ff9bf6edfb71972502ce93243eac52710fe44cfc16caf09c2c688a937f6d69b0ba2fea344c212ffecab6662dd50cb9a172b6565999a724721ae843b3f17c3a7d",
					timestamp: "1751888906120",
					total: "2000141733562397000",
					transactionsCount: 1,
					transactionsRoot: "a857421d0dc28d5d75958c9e9937350435e22f0e719fd2183ee5fc5f67837aa8",
					username: "genesis_41",
					validatorSet: "9004583606236067",
					version: 1,
				},
			},
		),
		// mockRequest(
		// 	"https://ark-test.arkvault.io/api/transactions?page=1&limit=12&address=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
		// 	"coins/ark/devnet/transactions/byAddress/D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD-1-10",
		// ),
		// mockRequest(
		// 	"https://ark-test.arkvault.io/api/transactions?page=1&limit=12&address=D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
		// 	"coins/ark/devnet/transactions/byAddress/D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb-1-10",
		// ),
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
		// mockRequest(
		// 	"https://ark-test.arkvault.io/api/transactions?page=1&limit=12&address=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
		// 	"coins/ark/devnet/transactions/byAddress/D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD-1-10",
		// ),
		// mockRequest(
		// 	"https://ark-test.arkvault.io/api/transactions?page=1&limit=12&address=D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
		// 	"coins/ark/devnet/transactions/byAddress/D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb-1-10",
		// ),
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
			await t.expect(Selector("[data-testid=NotificationsWrapper] [data-testid=TableRow]").count).eql(2);
		},
		"And the red dot is hidden": async (t: TestController) => {
			await t.hover(Selector("[data-testid=TableRow]"));
			await t
				.expect(Selector("[data-testid=NavigationBar__buttons--notifications] .rounded-full").exists)
				.notOk();
		},
	},
	[
		// mockRequest(
		// 	"https://ark-test.arkvault.io/api/transactions?page=1&limit=12&address=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
		// 	"coins/ark/devnet/transactions/byAddress/D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD-1-10",
		// ),
		// mockRequest(
		// 	"https://ark-test.arkvault.io/api/transactions?page=1&limit=12&address=D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
		// 	"coins/ark/devnet/transactions/byAddress/D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb-1-10",
		// ),
	],
);
