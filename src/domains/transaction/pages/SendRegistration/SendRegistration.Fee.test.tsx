/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import nock from "nock";
import React, { useEffect } from "react";
import { Route } from "react-router-dom";

import { SendRegistration } from "./SendRegistration";
import { minVersionList, useLedgerContext } from "@/app/contexts";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import {
	env,
	getDefaultProfileId,
	render,
	screen,
	syncDelegates,
	syncFees,
	waitFor,
	within,
	mockNanoXTransport,
} from "@/utils/testing-library";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let secondWallet: Contracts.IReadWriteWallet;
const history = createHashHistory();
let getVersionSpy: vi.SpyInstance;

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

const path = "/profiles/:profileId/wallets/:walletId/send-registration/:registrationType";

const renderPage = async (wallet: Contracts.IReadWriteWallet, type = "delegateRegistration") => {
	const registrationURL = `/profiles/${profile.id()}/wallets/${wallet.id()}/send-registration/${type}`;

	history.push(registrationURL);

	const SendRegistrationWrapper = () => {
		const { listenDevice } = useLedgerContext();

		useEffect(() => {
			listenDevice();
		}, []);

		return <SendRegistration />;
	};

	const utils = render(
		<Route path={path}>
			<SendRegistrationWrapper />
		</Route>,
		{
			history,
			route: registrationURL,
			withProviders: true,
		},
	);

	await expect(screen.findByTestId("Registration__form")).resolves.toBeVisible();

	return {
		...utils,
		history,
	};
};

const continueButton = () => screen.getByTestId("StepNavigation__continue-button");
const formStep = () => screen.findByTestId("DelegateRegistrationForm__form-step");

const reviewStepID = "DelegateRegistrationForm__review-step";

describe("Registration Fee", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().findByAddressWithNetwork("D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD", "ark.devnet")!;
		// secondWallet = profile.wallets().findByAddressWithNetwork("D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb", "ark.devnet")!;
		secondWallet = profile.wallets().push(
			await profile.walletFactory().fromAddress({
				address: "DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
				coin: "ARK",
				network: "ark.devnet",
			}),
		);

		getVersionSpy = vi
			.spyOn(wallet.coin().ledger(), "getVersion")
			.mockResolvedValue(minVersionList[wallet.network().coin()]);

		await wallet.synchroniser().identity();
		await secondWallet.synchroniser().identity();

		profile.wallets().push(
			await profile.walletFactory().fromAddress({
				address: "D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyib",
				coin: "ARK",
				network: "ark.devnet",
			}),
		);

		await syncDelegates(profile);
		await syncFees(profile);
	});

	afterAll(() => {
		getVersionSpy.mockRestore();
	});

	beforeEach(() => {
		nock.cleanAll();

		nock("https://ark-test-musig.arkvault.io/")
			.get("/api/wallets/DDA5nM7KEqLeTtQKv5qGgcnc6dpNBKJNTS")
			.reply(200, require("tests/fixtures/coins/ark/devnet/wallets/D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb.json"));

		nock("https://ark-test-musig.arkvault.io")
			.post("/")
			.reply(200, { result: { id: "03df6cd794a7d404db4f1b25816d8976d0e72c5177d17ac9b19a92703b62cdbbbc" } })
			.persist();
	});

	it("should set fee", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		await renderPage(wallet);

		await expect(formStep()).resolves.toBeVisible();

		userEvent.click(
			within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED),
		);
		await waitFor(() => expect(screen.getByTestId("InputCurrency")).toHaveValue("25"));

		userEvent.click(
			within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.SIMPLE),
		);

		expect(screen.queryByTestId("InputCurrency")).not.toBeInTheDocument();

		nanoXTransportMock.mockRestore();
	});

	it("should return to form step by cancelling fee warning", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		await renderPage(wallet);

		await expect(formStep()).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("Input__username"), "test_delegate");

		expect(screen.getByTestId("Input__username")).toHaveValue("test_delegate");

		// Fee
		userEvent.click(
			within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED),
		);

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "10");

		await waitFor(() => expect(inputElement).toHaveValue("10"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		userEvent.click(continueButton());

		// Fee warning
		expect(screen.getByTestId("FeeWarning__cancel-button")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("FeeWarning__cancel-button"));

		await expect(formStep()).resolves.toBeVisible();

		nanoXTransportMock.mockRestore();
	});

	it("should proceed to authentication step by confirming fee warning", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		await renderPage(wallet);

		await expect(formStep()).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("Input__username"), "test_delegate");

		expect(screen.getByTestId("Input__username")).toHaveValue("test_delegate");

		// Fee
		userEvent.click(
			within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED),
		);

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "10");

		await waitFor(() => expect(inputElement).toHaveValue("10"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		userEvent.click(continueButton());

		// Fee warning
		expect(screen.getByTestId("FeeWarning__continue-button")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("FeeWarning__continue-button"));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		nanoXTransportMock.mockRestore();
	});
});
