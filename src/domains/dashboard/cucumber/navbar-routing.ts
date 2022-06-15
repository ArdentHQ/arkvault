import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, getLocation, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";

const translations = buildTranslations();

const preSteps = {
	"Given Alice is signed into her profile": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
	},
};
cucumber("@routeToPortolio", {
	...preSteps,
	"When she selects portfolio in the navbar": async (t: TestController) => {
		await t.click(Selector("a").withExactText(translations.COMMON.PORTFOLIO));
	},
	"Then she is routed to the portfolio page": async (t: TestController) => {
		await t.expect(getLocation()).contains("/dashboard");
	},
});
cucumber("@routeToExchange", {
	...preSteps,
	"When she selects exchange in the navbar": async (t: TestController) => {
		await t.click(Selector("a").withExactText(translations.EXCHANGE.PAGE_EXCHANGES.TITLE));
	},
	"Then she is routed to the exchange page": async (t: TestController) => {
		await t.expect(getLocation()).contains("/exchange");
		await t.expect(Selector("h1").withExactText(translations.EXCHANGE.PAGE_EXCHANGES.TITLE).exists).ok();
	},
});
cucumber(
	"@routeToNews",
	{
		...preSteps,
		"When she selects news in the navbar": async (t: TestController) => {
			await t.click(Selector("a").withExactText(translations.NEWS.NEWS));
		},
		"Then she is routed to the news page": async (t: TestController) => {
			await t.expect(getLocation()).contains("/news");
			await t.expect(Selector("h1").withExactText(translations.NEWS.PAGE_NEWS.TITLE).exists).ok();
		},
	},
	[mockRequest("https://news.arkvault.io/api?coins=ARK&page=1", "news/page-1")],
);
cucumber("@routeToSend", {
	...preSteps,
	"When she selects send in the navbar": async (t: TestController) => {
		await t.expect(Selector("[data-testid=NavigationBar__buttons--send]").hasAttribute("disabled")).notOk();
		await t.click(Selector("[data-testid=NavigationBar__buttons--send]"));
	},
	"Then she is routed to the send page": async (t: TestController) => {
		await t.click(
			Selector("div").withExactText(translations.TRANSACTION.PAGE_TRANSACTION_SEND.FORM_STEP.DESCRIPTION),
		);
		await t.expect(getLocation()).contains("/send-transfer");
	},
});
