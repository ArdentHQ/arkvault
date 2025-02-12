import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { SignMessage } from "./SignMessage";
import { translations as messageTranslations } from "@/domains/message/i18n";
import {
	env,
	getDefaultProfileId,
	MNEMONICS,
	render,
	screen,
	waitFor,
	mockProfileWithPublicAndTestNetworks,
	triggerMessageSignOnce,
} from "@/utils/testing-library";

const history = createHashHistory();

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let wallet2: Contracts.IReadWriteWallet;

const mnemonic = MNEMONICS[0];

const continueButton = () => screen.getByTestId("SignMessage__continue-button");
const messageInput = () => screen.getByTestId("SignMessage__message-input");

const signMessage = "Hello World";

const expectHeading = async (text: string) => {
	await waitFor(() => {
		expect(screen.getByTestId("header__title")).toHaveTextContent(text);
	});
};

// Mock implementation of TextEncoder to always return Uint8Array.
vi.stubGlobal(
	"TextEncoder",
	class MockTextEncoder {
		encode(text) {
			return new Uint8Array([...text].map((character) => character.codePointAt(0)));
		}
	},
);

describe("SignMessage", () => {
	beforeAll(async () => {
		process.env.MOCK_AVAILABLE_NETWORKS = "false";
		profile = env.profiles().findById(getDefaultProfileId());

		wallet = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic,
			network: "ark.devnet",
		});

		wallet2 = await profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic,
			network: "ark.mainnet",
		});

		profile.wallets().push(wallet);
		profile.wallets().push(wallet2);

		profile.coins().set("ARK", "ark.devnet");

		await triggerMessageSignOnce(wallet);
	});

	describe("Sign with deeplink", () => {
		let resetProfileNetworksMock: () => void;

		beforeEach(() => {
			resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
		});

		afterEach(() => {
			resetProfileNetworksMock();
		});

		it("should show address selector if using deeplinking", async () => {
			const signUrl = `/profiles/${getDefaultProfileId()}/sign-message?coin=ARK&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867&method=sign&message=${encodeURIComponent(
				signMessage,
			)}`;

			history.push(signUrl);

			render(
				<Route path="/profiles/:profileId/sign-message">
					<SignMessage />
				</Route>,
				{
					history,
					route: signUrl,
				},
			);

			await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

			expect(
				screen.getByText(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_SELECT_WALLET),
			).toBeInTheDocument();

			expect(messageInput()).toHaveValue(signMessage);

			await waitFor(() => expect(continueButton()).toBeDisabled());

			await userEvent.click(screen.getByTestId("SelectAddress__wrapper"));

			await waitFor(() => {
				expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
			});

			const firstAddress = screen.getByTestId("SearchWalletListItem__select-0");

			await userEvent.click(firstAddress);

			await waitFor(() => expect(continueButton()).toBeEnabled());

			await userEvent.click(continueButton());

			await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);
		});

		it("should select address from deeplinking", async () => {
			const signUrl = `/profiles/${getDefaultProfileId()}/sign-message?coin=ARK&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867&method=sign&message=${encodeURIComponent(
				signMessage,
			)}&address=${wallet2.address()}`;

			history.push(signUrl);

			render(
				<Route path="/profiles/:profileId/sign-message">
					<SignMessage />
				</Route>,
				{
					history,
					route: signUrl,
				},
			);

			await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

			expect(
				screen.getByText(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_MNEMONIC),
			).toBeInTheDocument();

			expect(messageInput()).toHaveValue(signMessage);

			const mnemonicInput = screen.getByTestId("AuthenticationStep__mnemonic");
			await userEvent.type(mnemonicInput, mnemonic);

			expect(continueButton()).toBeEnabled();
			vi.restoreAllMocks();
		});

		it("back button sends to welcome page", async () => {
			const signUrl = `/profiles/${getDefaultProfileId()}/sign-message?coin=ARK&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867&method=sign&message=${encodeURIComponent(
				signMessage,
			)}`;

			history.push(signUrl);

			render(
				<Route path="/profiles/:profileId/sign-message">
					<SignMessage />
				</Route>,
				{
					history,
					route: signUrl,
				},
			);

			await expectHeading(messageTranslations.PAGE_SIGN_MESSAGE.FORM_STEP.TITLE);

			const historySpy = vi.spyOn(history, "push");

			await userEvent.click(screen.getByTestId("SignMessage__back-button"));

			expect(historySpy).toHaveBeenCalledWith(`/`);
		});
	});
});
