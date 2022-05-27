import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToSettings } from "../e2e/common";

const translations = buildTranslations();

let automaticSignOutPeriod: string | undefined;
let name: string | undefined;

cucumber("@resetProfile", {
	"Given Alice is on the Settings page": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToSettings(t);
	},
	"And has made changes to her settings": async (t: TestController) => {
		await t.click(Selector("[data-testid=Input__suggestion]").withText("15 minutes"));
		await t.click('[data-testid="SelectDropdown__option--0"]');
		await t.click(Selector("button").withText(translations.COMMON.SAVE));
		automaticSignOutPeriod = await Selector("input[name=automaticSignOutPeriod]").value;
		name = await Selector("input[name=name]").value;
	},
	"When she resets her profile": async (t: TestController) => {
		await t.click(Selector("button").withText(translations.COMMON.RESET));
	},
	"And confirms the reset": async (t: TestController) => {
		await t.click(Selector("button").withText(translations.COMMON.RESET).nth(-1));
	},
	"Then all settings are reset to default": async (t: TestController) => {
		await t.expect(Selector("input[name=name]").value).eql(name);
		await t.expect(Selector("input[name=automaticSignOutPeriod]").value).notEql(automaticSignOutPeriod);
	},
});
