import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, E2E_TX_API_URL, MNEMONICS, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { importWallet } from "../../portfolio/e2e/common";

const translations = buildTranslations();

export const openContractDeploymentSidePanel = async (t: any) => {
	await t.click(Selector('[data-testid="WalletHeaderMobile__more-button"]'));
	await t.click(
		Selector('[data-testid="dropdown__options"] li').withText(
			translations.WALLETS.PAGE_WALLET_DETAILS.OPTIONS.DEPLOY,
		),
	);

	await t.expect(Selector("h2").withText(translations.TRANSACTION.CONTRACT_DEPLOYMENT.FORM_STEP.TITLE).exists).ok();
};

const preSteps = {
	"Given Alice opens up contract deployment side panel": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
		await importWallet(t, MNEMONICS[0]);
		await openContractDeploymentSidePanel(t);
	},
};
cucumber(
	"@contractDeployment",
	{
		...preSteps,
		"When she enters a valid bytecode": async (t: TestController) => {
			await t.expect(Selector("[data-testid=Registration__form]").exists).ok();
			await t.typeText(Selector("[data-testid=ContractDeployment_Bytecode]"), "0x60006000F3", { replace: true });
			await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).notOk();
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
			await t.expect(Selector("span").withText("0x60006000F3").exists).ok();
			await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
		},
		"And sends the contract deployment transaction": async (t: TestController) => {
			await t.expect(Selector("h2").withText(translations.TRANSACTION.AUTHENTICATION_STEP.TITLE).exists).ok();
			await t.typeText(Selector("[data-testid=AuthenticationStep__mnemonic]"), MNEMONICS[0]);
			await t.expect(Selector("[data-testid=AuthenticationStep__mnemonic]").hasAttribute("aria-invalid")).notOk();
			const sendButton = Selector("[data-testid=SendRegistration__send-button]");
			await t.expect(sendButton.hasAttribute("disabled")).notOk();
			await t.click(sendButton);
		},
		"Then the transaction is sent successfully": async (t: TestController) => {
			await t
				.expect(Selector("h2").withText(translations.TRANSACTION.SUCCESS.CREATED).exists)
				.ok({ timeout: 5000 });
		},
	},
	[
		mockRequest(
			{
				method: "POST",
				url: `${E2E_TX_API_URL}transactions`,
			},
			{
				data: {
					accept: [0],
					broadcast: [0],
					excess: [],
					invalid: [],
				},
			},
		),
	],
);

cucumber("@contractDeployment-invalidMnemonic", {
	...preSteps,
	"When she fills the form with an invalid mnemonic": async (t: TestController) => {
		await t.expect(Selector("[data-testid=Registration__form]").exists).ok();
		await t.typeText(Selector("[data-testid=ContractDeployment_Bytecode]"), "0x60006000F3", { replace: true });
		await t.expect(Selector("button").withText(translations.COMMON.CONTINUE).hasAttribute("disabled")).notOk();
		await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
		await t.expect(Selector("span").withText("0x60006000F3").exists).ok();
		await t.click(Selector("button").withText(translations.COMMON.CONTINUE));
		await t.expect(Selector("h2").withText(translations.TRANSACTION.AUTHENTICATION_STEP.TITLE).exists).ok();
		await t.typeText(Selector("[data-testid=AuthenticationStep__mnemonic]"), "wrong mnemonic", { replace: true });
	},
	"Then an error is displayed on the mnemonic field": async (t: TestController) => {
		await t.expect(Selector("[data-testid=AuthenticationStep__mnemonic]").hasAttribute("aria-invalid")).ok();
	},
	"And the send button is disabled": async (t: TestController) => {
		await t.expect(Selector("[data-testid=SendRegistration__send-button]").hasAttribute("disabled")).ok();
	},
});
