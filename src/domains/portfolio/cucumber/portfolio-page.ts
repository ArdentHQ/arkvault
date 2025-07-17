import { Selector } from "testcafe";

import { cucumber, mockRequest, scrollToBottom, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";

let count: any;

const preSteps = {
	"Given Alice is signed into a profile": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
	},
};
cucumber(
	"@portfolioPage-loadMore",
	{
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
	},
);
