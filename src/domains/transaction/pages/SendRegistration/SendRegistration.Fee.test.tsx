import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React, { useEffect } from "react";
import { PublicKeyService } from "@/app/lib/mainsail/public-key.service";
import { SendRegistration } from "./SendRegistration";
import { minVersionList, useLedgerContext } from "@/app/contexts";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import {
	env,
	getMainsailProfileId,
	render,
	screen,
	syncValidators,
	syncFees,
	waitFor,
	within,
	mockNanoXTransport,
} from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";

import walletFixture from "@/tests/fixtures/coins/mainsail/devnet/wallets/0x8A3117649655714c296cd816691e01C5148922ed.json";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let secondWallet: Contracts.IReadWriteWallet;
let getVersionSpy: vi.SpyInstance;

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

const renderPage = async (wallet: Contracts.IReadWriteWallet, type = "validatorRegistration") => {
	const registrationURL = `/profiles/${profile.id()}/wallets/${wallet.id()}/send-registration/${type}`;

	const SendRegistrationWrapper = () => {
		const { listenDevice } = useLedgerContext();

		useEffect(() => {
			listenDevice();
		}, []);

		return <SendRegistration />;
	};

	const view = render(<SendRegistrationWrapper />, {
		route: registrationURL,
		withProviders: true,
	});

	await expect(screen.findByTestId("Registration__form")).resolves.toBeVisible();

	return view;
};

const continueButton = () => screen.getByTestId("StepNavigation__continue-button");
const formStep = () => screen.findByTestId("ValidatorRegistrationForm_form-step");

const reviewStepID = "ValidatorRegistrationForm__review-step";

describe("Registration Fee", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile
			.wallets()
			.findByAddressWithNetwork("0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6", "mainsail.devnet")!;

		secondWallet = profile.wallets().push(
			await profile.walletFactory().fromAddress({
				address: "0x659A76be283644AEc2003aa8ba26485047fd1BFB",
				coin: "Mainsail",
				network: "mainsail.devnet",
			}),
		);

		getVersionSpy = vi
			.spyOn(wallet.ledger(), "getVersion")
			.mockResolvedValue(minVersionList[wallet.network().coin()]);

		await wallet.synchroniser().identity();
		await secondWallet.synchroniser().identity();

		await syncValidators(profile);
		await syncFees(profile);
	});

	afterAll(() => {
		getVersionSpy.mockRestore();
	});

	beforeEach(() => {
		server.use(
			requestMock(
				"https://ark-test-musig.arkvault.io/api/wallets/DDA5nM7KEqLeTtQKv5qGgcnc6dpNBKJNTS",
				walletFixture,
			),
			requestMock("https://dwallets-evm.mainsailhq.com/api?attributes.validatorPublicKey=*", {
				result: { id: "03df6cd794a7d404db4f1b25816d8976d0e72c5177d17ac9b19a92703b62cdbbbc" },
			}),
			requestMock(
				"https://ark-test-musig.arkvault.io",
				{ result: { id: "03df6cd794a7d404db4f1b25816d8976d0e72c5177d17ac9b19a92703b62cdbbbc" } },
				{ method: "post" },
			),
		);
	});

	it("should set fee", async () => {
		vi.spyOn(PublicKeyService.prototype, "verifyPublicKeyWithBLS").mockReturnValue(true);

		const nanoXTransportMock = mockNanoXTransport();
		await renderPage(wallet);

		await expect(formStep()).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("Input__validator_public_key"));
		await userEvent.type(screen.getByTestId("Input__validator_public_key"), "validator-public-key");
		await waitFor(() =>
			expect(screen.getByTestId("Input__validator_public_key")).toHaveValue("validator-public-key"),
		);

		await waitFor(() => expect(continueButton()).toBeEnabled());

		// Step 2
		await userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await userEvent.click(
			within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED),
		);
		await waitFor(() => expect(screen.getByTestId("Input_GasPrice")).toHaveValue("5.06670125"));
		await waitFor(() => expect(screen.getByTestId("Input_GasLimit")).toHaveValue("400000"));

		await userEvent.click(
			within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.SIMPLE),
		);

		expect(screen.queryByTestId("Input_GasPrice")).not.toBeInTheDocument();

		nanoXTransportMock.mockRestore();
	});

	it.skip("should return to form step by cancelling fee warning", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		await renderPage(wallet);

		await expect(formStep()).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("Input__username"), "test_validator");
		await userEvent.type(screen.getByTestId("Input__username"), "test_validator");

		expect(screen.getByTestId("Input__username")).toHaveValue("test_validator");

		// Fee
		await userEvent.click(
			within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED),
		);

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		await userEvent.clear(inputElement);
		await userEvent.type(inputElement, "10");

		await waitFor(() => expect(inputElement).toHaveValue("10"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await userEvent.click(continueButton());

		// Fee warning
		expect(screen.getByTestId("FeeWarning__cancel-button")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("FeeWarning__cancel-button"));

		await expect(formStep()).resolves.toBeVisible();

		nanoXTransportMock.mockRestore();
	});

	it.skip("should proceed to authentication step by confirming fee warning", async () => {
		const nanoXTransportMock = mockNanoXTransport();
		await renderPage(wallet);

		await expect(formStep()).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("Input__username"));
		await userEvent.type(screen.getByTestId("Input__username"), "test_validator");

		expect(screen.getByTestId("Input__username")).toHaveValue("test_validator");

		// Fee
		await userEvent.click(
			within(screen.getByTestId("InputFee")).getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED),
		);

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		await userEvent.clear(inputElement);
		await userEvent.type(inputElement, "10");

		await waitFor(() => expect(inputElement).toHaveValue("10"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		// Review Step
		expect(screen.getByTestId(reviewStepID)).toBeInTheDocument();

		await userEvent.click(continueButton());

		// Fee warning
		expect(screen.getByTestId("FeeWarning__continue-button")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("FeeWarning__continue-button"));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		nanoXTransportMock.mockRestore();
	});
});
