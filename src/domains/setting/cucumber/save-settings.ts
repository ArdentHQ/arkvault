import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { importWalletByAddress } from "../../wallet/e2e/common";
import { goToSettings, saveSettings } from "../e2e/common";

const translations = buildTranslations();
const nameInput = Selector('input[data-testid="General-settings__input--name"]');

const postSteps = {
	"And saves her settings": async (t: TestController) => {
		await t.click(Selector("button").withText(translations.COMMON.SAVE));
	},
	"Then a success toast message is displayed": async (t: TestController) => {
		await t
			.expect(
				Selector("[data-testid=ToastMessage__content]").withText(translations.SETTINGS.GENERAL.SUCCESS).exists,
			)
			.ok();
		await t.click(Selector("[data-testid=ToastMessage__close-button]"));
		await t
			.expect(
				Selector("[data-testid=ToastMessage__content]").withText(translations.SETTINGS.GENERAL.SUCCESS).exists,
			)
			.notOk();
	},
};
cucumber("@saveSettings-general", {
	"Given Alice is on the general settings page": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToSettings(t);
	},
	"When she changes her general settings": async (t: TestController) => {
		await t.click(nameInput).pressKey("ctrl+a delete").typeText(nameInput, "Anne Doe");
	},
	...postSteps,
});
cucumber("@saveSettings-appearance", {
	"Given Alice is on the appearance settings page": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToSettings(t);
		await t.click(Selector("[data-testid=side-menu__item--appearance]"));
		await t.expect(Selector("[data-testid=header__title]").textContent).eql(translations.SETTINGS.APPEARANCE.TITLE);
	},
	"When she changes her appearance settings": async (t: TestController) => {
		await t.click(
			Selector("button").withText(translations.SETTINGS.APPEARANCE.OPTIONS.VIEWING_MODE.VIEWING_MODES.DARK),
		);
	},
	...postSteps,
});
cucumber("@saveSettings-unsavedChanges", {
	"Given Alice is on the general settings page": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToSettings(t);
	},
	"When she changes her general settings": async (t: TestController) => {
		await t.click(nameInput).pressKey("ctrl+a delete").typeText(nameInput, "Anne Doe");
	},
	"And navigates to a different page before saving": async (t: TestController) => {
		await t.click(Selector("a").withText(translations.COMMON.PORTFOLIO));
	},
	"Then a confirmation modal is displayed": async (t: TestController) => {
		await t.expect(Selector('[data-testid="ConfirmationModal"]').exists).ok();
	},
	"When she reverts her changes": async (t: TestController) => {
		await t.click(Selector('[data-testid="ConfirmationModal__no-button"]'));
		await t.click(nameInput).pressKey("ctrl+a delete").typeText(nameInput, "John Doe");
	},
	"Then the confirmation modal is not displayed": async (t: TestController) => {
		await t.expect(Selector('[data-testid="ConfirmationModal"]').exists).notOk();
	},
});
cucumber(
	"@saveSettings-updateCurrency",
	{
		"Given Alice signs into a profile with a wallet": async (t: TestController) => {
			await visitWelcomeScreen(t);
			await goToProfile(t);
			await importWalletByAddress(t, "0xb0E6c955a0Df13220C36Ea9c95bE471249247E57", undefined, true);
		},
		"And she is on the settings page": async (t: TestController) => {
			await t.click(Selector('[data-testid="UserMenu"]'));
			await t
				.expect(Selector('[data-testid="dropdown__options"] li').withText(translations.COMMON.SETTINGS).exists)
				.ok();
			await t.click(Selector('[data-testid="dropdown__options"] li').withText(translations.COMMON.SETTINGS));
			await t.expect(Selector("h1").withText(translations.SETTINGS.GENERAL.TITLE).exists).ok();
		},
		"When she saves a new currency setting": async (t: TestController) => {
			await t.click(Selector("[aria-owns=select-currency-menu] [data-testid=SelectDropdown__caret]"));
			await t.click(Selector("#select-currency-menu .select-list-option").withText("ETH (Ξ)"));
			await saveSettings(t);
		},
		"Then the balance in the navbar is updated": async (t: TestController) => {
			await t.expect(Selector("[data-testid=Balance__value]").withText("0 ETH").exists).notOk();
		},
	},
	[
		mockRequest(
			"https://ark-live.arkvault.io/api/transactions?page=1&limit=20&senderId=0xb0E6c955a0Df13220C36Ea9c95bE471249247E57",
			[],
		),
		mockRequest(
			"https://ark-live.arkvault.io/api/transactions?limit=30&address=0xb0E6c955a0Df13220C36Ea9c95bE471249247E57",
			[],
		),
	],
);
