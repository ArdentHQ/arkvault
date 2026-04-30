import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, E2E_PUBLIC_API_URL, MNEMONICS, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToProfile } from "../../profile/e2e/common";
import { importWallet, modal } from "../../portfolio/e2e/common";

export const goToTokensPage = async (t: TestController) => {
	await t.click(Selector("a").withText(translations.COMMON.TOKENS));
	await t.expect(Selector("h1").withText(translations.TOKENS.PAGE_TITLE).exists).ok();
};

const translations = buildTranslations();
const validContractAddress = "0xac2865629a820e18f3af48659f935cbcd5a9a4b4";
const invalidContractAddress = "0xbc2065629a820e18f3af48659f935cbcd5a9a4ee";

const preSteps = {
	"Given Alice signs into a profile": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToProfile(t);
		await importWallet(t, MNEMONICS[0]);
	},
	"And navigates to the tokens page": async (t: TestController) => {
		await goToTokensPage(t);
	},
	"And opens up add token side panel": async (t: TestController) => {
		await t.click(Selector("[data-testid=Tokens__AddToken]"));
		await t.expect(Selector("h2").withText(translations.COMMON.ADD_TOKEN).exists).ok({ timeout: 60_000 });
	},
};

const mockAddTokenRequests = () => {
	return [
		mockRequest(`${E2E_PUBLIC_API_URL}tokens/${validContractAddress}`, {
			data: {
				address: "0xac2865629a820e18f3af48659f935cbcd5a9a4b4",
				symbol: "SamCoin",
				name: "SAM",
				decimals: 18,
				totalSupply: "115792089237316195423570985008687907853269984665640564039457584007913129639935",
				deploymentHash: "61e7a27459b1d61893d2d89d2ed279301176ed0eae64bba734c734a6f1b3e027",
			},
		}),
		mockRequest(
			`${E2E_PUBLIC_API_URL}wallets/tokens?addresses=0x659A76be283644AEc2003aa8ba26485047fd1BFB&minBalance=0&whitelist=0xac2865629a820e18f3af48659f935cbcd5a9a4b4&limit=30`,
			{
				meta: {
					totalCountIsEstimate: false,
					count: 2,
					first: `/wallets/tokens?addresses=0x659A76be283644AEc2003aa8ba26485047fd1BFB&minBalance=0&whitelist=0xac2865629a820e18f3af48659f935cbcd5a9a4b4&limit=30`,
					last: `/wallets/tokens?addresses=0x659A76be283644AEc2003aa8ba26485047fd1BFB&minBalance=0&whitelist=0xac2865629a820e18f3af48659f935cbcd5a9a4b4&limit=30`,
					next: null,
					pageCount: 1,
					previous: null,
					self: `/wallets/tokens?addresses=0x659A76be283644AEc2003aa8ba26485047fd1BFB&minBalance=0&whitelist=0xac2865629a820e18f3af48659f935cbcd5a9a4b4&limit=30`,
					totalCount: 2,
				},
				data: [
					{
						token: "0x12f6677522292654a231007c47b07971a7610908",
						symbol: "Lorem",
						name: "Lorem ipsum",
						decimals: 18,
						supply: "123456789000000000000000000",
						addresses: {
							"0x659A76be283644AEc2003aa8ba26485047fd1BFB": "123456789000000000000000000",
						},
					},
					{
						token: "0xac2865629a820e18f3af48659f935cbcd5a9a4b4",
						symbol: "DARK20",
						name: "DARK20",
						decimals: 18,
						supply: "100000000000000000000000000",
						addresses: {
							"0x659A76be283644AEc2003aa8ba26485047fd1BFB": "100000000000000000000000000",
						},
					},
				],
			},
		),
	]
}

cucumber(
	"@addValidContract",
	{
		...preSteps,
		"When she attempts to add a token with a valid contract address": async (t: TestController) => {
			await t.typeText(Selector("[data-testid=Input__ContractAddress]"), validContractAddress, { paste: true });
			await t.expect(Selector("[data-testid=AddToken__save-button]").hasAttribute("disabled")).notOk();
			await t.click(Selector("[data-testid=AddToken__save-button]"));
		},
		"Then a success toast message is displayed": async (t: TestController) => {
			await t
				.expect(
					Selector("[data-testid=ToastMessage__content]").withText("Token SAM (SamCo…) successfully added")
						.exists,
				)
				.ok();
		},
	},
	mockAddTokenRequests(),
);

cucumber(
	"@addInvalidContract",
	{
		...preSteps,
		"When she attempts to add a token with a invalid contract address": async (t: TestController) => {
			await t.typeText(Selector("[data-testid=Input__ContractAddress]"), invalidContractAddress, { paste: true });
			await t.expect(Selector("[data-testid=AddToken__save-button]").hasAttribute("disabled")).ok();
		},
		"Then an error message is displayed": async (t: TestController) => {
			await t
				.expect(Selector("div").withText(translations.TOKENS.ADD_TOKEN.STATE_INVALID_TOKEN_TEXT).exists)
				.ok();
		},
	},
	[mockRequest(`${E2E_PUBLIC_API_URL}tokens/${invalidContractAddress}`, {}, 404)],
);

cucumber(
	"@deleteToken",
	{
		...preSteps,
		"When she attempts to add a token with a valid contract address": async (t: TestController) => {
			await t.typeText(Selector("[data-testid=Input__ContractAddress]"), validContractAddress, { paste: true });
			await t.expect(Selector("[data-testid=AddToken__save-button]").hasAttribute("disabled")).notOk();
			await t.click(Selector("[data-testid=AddToken__save-button]"));
		},
		"Then a success toast message is displayed": async (t: TestController) => {
			await t
				.expect(
					Selector("[data-testid=ToastMessage__content]").withText("Token SAM (SamCo…) successfully added")
						.exists,
				)
				.ok();
		},
		"And switches to manage mode": async (t: TestController) => {
			await t.click(Selector("[data-testid=TokensTable_Manage]"));
			await t.expect(Selector("[data-testid=TokenRow_DeleteToken]").exists).ok();
		},
		"When she attempts to delete a token": async (t: TestController) => {
			await t.click(Selector("[data-testid=TokenRow_DeleteToken]"));
			await t.expect(modal.exists).ok();
			await t.click(Selector("[data-testid=DeleteResource__submit-button]"));
			await t.expect(modal.exists).notOk();
			await t.click(Selector("[data-testid=TokensTable_Save]"));
			await t.expect(Selector("[data-testid=TokensTable_Save]").exists).notOk();
		},
		"Then it should disappear from tokens table": async (t: TestController) => {
			await t.expect(Selector("[data-testid=TokensTableRow]").count).eql(2);
		},
	},
	mockAddTokenRequests(),
);

cucumber(
	"@enableHideDust",
	{
		"Given Alice signs into a profile": async (t: TestController) => {
			await visitWelcomeScreen(t);
			await goToProfile(t);
			await importWallet(t, MNEMONICS[0]);
		},
		"And navigates to the tokens page": async (t: TestController) => {
			await goToTokensPage(t);
		},
		"When she enables Hide Dust": async (t: TestController) => {
			await t.click(Selector("[data-testid=HideDustTokens__Wrapper] .toggle-handle"));
		},
		"Then tokens list should refresh": async (t: TestController) => {
			await t.expect(Selector("[data-testid=TokensTableRow]").count).eql(1);
		}
	},
	[
		mockRequest(
			`${E2E_PUBLIC_API_URL}wallets/tokens?addresses=0x659A76be283644AEc2003aa8ba26485047fd1BFB&minBalance=0.01&limit=30`,
			{
				meta: {
					totalCountIsEstimate: false,
					count: 1,
					first: `/wallets/tokens?addresses=0x659A76be283644AEc2003aa8ba26485047fd1BFB&minBalance=0.01&limit=30`,
					last: `/wallets/tokens?addresses=0x659A76be283644AEc2003aa8ba26485047fd1BFB&minBalance=0.01&limit=30`,
					next: null,
					pageCount: 1,
					previous: null,
					self: `/wallets/tokens?addresses=0x659A76be283644AEc2003aa8ba26485047fd1BFB&minBalance=0.01&limit=30`,
					totalCount: 1,
				},
				data: [
					{
						token: "0xac2865629a820e18f3af48659f935cbcd5a9a4b4",
						symbol: "DARK20",
						name: "DARK20",
						decimals: 18,
						supply: "100000000000000000000000000",
						addresses: {
							"0x659A76be283644AEc2003aa8ba26485047fd1BFB": "100000000000000000000000000",
						},
					},
				],
			},
		)
	]
);
