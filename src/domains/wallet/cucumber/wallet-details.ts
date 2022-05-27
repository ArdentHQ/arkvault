import { Selector } from "testcafe";

import { CustomSelector, CustomSnapshot } from "../../../utils/e2e-interfaces";
import { cucumber, scrollToBottom } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { goToWallet } from "../e2e/common";

let count: any;
let starButton: any;
let starButtonContent: any;

const preSteps = {
	"Given Alice is on the wallet details page": async (t: TestController) => {
		await goToProfile(t);
		await goToWallet(t);
	},
};
cucumber("@walletDetails-loadMore", {
	...preSteps,
	"When she selects to view more transactions": async (t: TestController) => {
		await t.expect(Selector("[data-testid=TransactionTable]").exists).ok();
		await t.expect(Selector("[data-testid=transactions__fetch-more-button]").exists).ok();
		count = await Selector("[data-testid=TransactionTable] [data-testid=TableRow]").count;
		await scrollToBottom();
		await t.click(Selector("[data-testid=transactions__fetch-more-button]"));
	},
	"Then the transaction count is increased": async (t: TestController) => {
		await t.expect(Selector("[data-testid=TransactionTable] [data-testid=TableRow]").count).gt(count);
	},
});
cucumber("@walletDetails-star", {
	...preSteps,
	"When she selects the star icon": async (t: TestController) => {
		starButton = <CustomSelector>Selector("[data-testid=WalletHeader__star-button]").addCustomDOMProperties({
			innerHTML: (element) => element.innerHTML,
		});
		starButtonContent = (<CustomSnapshot>await starButton()).innerHTML;
		await t.click(starButton);
	},
	"Then the wallet is saved as starred": async (t: TestController) => {
		await t.expect(starButton.innerHTML).notEql(starButtonContent);
	},
});
