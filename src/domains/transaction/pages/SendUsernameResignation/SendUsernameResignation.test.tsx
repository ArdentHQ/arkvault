import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { SendUsernameResignation } from "./SendUsernameResignation";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import transactionFixture from "@/tests/fixtures/coins/ark/devnet/transactions/transfer.json";
import {
	env,
	getDefaultProfileId,
	MNEMONICS,
	render,
	screen,
	syncDelegates,
	syncFees,
	waitFor,
	within,
} from "@/utils/testing-library";

let wallet: Contracts.IReadWriteWallet;
let profile: Contracts.IProfile;

let resignationUrl: string;

const passphrase = MNEMONICS[0];
const history = createHashHistory();
const feeWarningContinueID = "FeeWarning__continue-button";

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

const renderPage = () => {
	const path = "/profiles/:profileId/wallets/:walletId/send-username-resignation";

	return render(
		<Route path={path}>
			<SendUsernameResignation />
		</Route>,
		{
			history,
			route: resignationUrl,
		},
	);
};

const transactionResponse = {
	amount: () => +transactionFixture.data.amount / 1e8,
	data: () => ({ data: () => transactionFixture.data }),
	explorerLink: () => `https://test.arkscan.io/transaction/${transactionFixture.data.id}`,
	fee: () => +transactionFixture.data.fee / 1e8,
	id: () => transactionFixture.data.id,
	isMultiSignatureRegistration: () => false,
	recipient: () => transactionFixture.data.recipient,
	sender: () => transactionFixture.data.sender,
	type: () => "usernameResignation",
	usesMultiSignature: () => false,
};

const createTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue(transactionResponse as any);

const secondMnemonic = () => screen.getByTestId("AuthenticationStep__second-mnemonic");
const reviewStep = () => screen.findByTestId("SendUsernameResignation__review-step");
const continueButton = () => screen.getByTestId("StepNavigation__continue-button");
const formStep = () => screen.findByTestId("SendUsernameResignation__form-step");
const sendButton = () => screen.getByTestId("StepNavigation__send-button");

let mnemonicMock;
let secondMnemonicMock;

describe("SendUsernameResignation", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		// @TODO: use proper mainsail wallet once mainsail network is setup.
		// @see https://app.clickup.com/t/86dtaccqj
		wallet = profile.wallets().push(
			await profile.walletFactory().fromMnemonicWithBIP39({
				coin: "ARK",
				mnemonic: passphrase,
				network: "ark.devnet",
			}),
		);
		await wallet.synchroniser().identity();

		await syncDelegates(profile);
		await syncFees(profile);
	});

	beforeEach(() => {
		resignationUrl = `/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}/send-username-resignation`;
		history.push(resignationUrl);

		mnemonicMock = vi
			.spyOn(wallet.coin().address(), "fromMnemonic")
			.mockResolvedValue({ address: wallet.address() });

		secondMnemonicMock = vi
			.spyOn(wallet.coin().publicKey(), "fromMnemonic")
			.mockResolvedValue({ publicKey: wallet.publicKey() });
	});

	it("should show mnemonic authentication error", async () => {
		mnemonicMock.mockRestore();
		secondMnemonicMock.mockRestore();

		const { publicKey } = await wallet.coin().publicKey().fromMnemonic(MNEMONICS[1]);

		const secondPublicKeyMock = vi.spyOn(wallet, "secondPublicKey").mockReturnValue(publicKey);

		const { asFragment } = renderPage();

		await expect(formStep()).resolves.toBeVisible();

		await expect(screen.findByTestId("InputFee")).resolves.toBeInTheDocument();

		// Fee(advanced);
		userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "1");

		await waitFor(() => expect(continueButton()).toBeEnabled());

		userEvent.click(continueButton());

		await expect(reviewStep()).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		if (!profile.settings().get(Contracts.ProfileSetting.DoNotShowFeeWarning)) {
			await expect(screen.findByTestId(feeWarningContinueID)).resolves.toBeVisible();

			userEvent.click(screen.getByTestId(feeWarningContinueID));
		}

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		await waitFor(() => {
			expect(secondMnemonic()).toBeEnabled();
		});

		userEvent.type(secondMnemonic(), MNEMONICS[2]);
		await waitFor(() => expect(secondMnemonic()).toHaveValue(MNEMONICS[2]));

		await waitFor(() => {
			expect(secondMnemonic()).toHaveAttribute("aria-invalid");
		});

		expect(sendButton()).toBeDisabled();

		expect(asFragment()).toMatchSnapshot();

		secondPublicKeyMock.mockRestore();
	});

	it("should render 1st step", async () => {
		const { asFragment } = renderPage();

		await expect(formStep()).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should change fee", async () => {
		const { asFragment } = renderPage();

		await expect(formStep()).resolves.toBeVisible();

		await expect(screen.findByTestId("InputFee")).resolves.toBeInTheDocument();

		// Fee (simple)
		expect(screen.getAllByRole("radio")[1]).toBeChecked();

		userEvent.click(within(screen.getByTestId("InputFee")).getAllByRole("radio")[2]);
		await waitFor(() => expect(screen.getAllByRole("radio")[2]).toBeChecked());

		// Fee(advanced);
		userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "1");

		await waitFor(() => expect(inputElement).toHaveValue("1"));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render 2nd step", async () => {
		const { asFragment } = renderPage();

		await expect(formStep()).resolves.toBeVisible();
		await expect(screen.findByTestId("InputFee")).resolves.toBeInTheDocument();

		// Fee(advanced);
		userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "1");

		await waitFor(() => expect(continueButton()).toBeEnabled());

		userEvent.click(continueButton());

		await expect(reviewStep()).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should go back to wallet details", async () => {
		const historySpy = vi.spyOn(history, "push").mockImplementation(vi.fn());

		renderPage();

		await expect(formStep()).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("StepNavigation__back-button"));

		expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/wallets/${wallet.id()}`);

		historySpy.mockRestore();
	});

	it("should navigate between 1st and 2nd step", async () => {
		renderPage();

		await expect(formStep()).resolves.toBeVisible();

		// Fee(advanced);
		userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "1");

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await expect(reviewStep()).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("StepNavigation__back-button"));

		await expect(formStep()).resolves.toBeVisible();
	});

	it("should render 3rd step", async () => {
		const { asFragment } = renderPage();

		await expect(formStep()).resolves.toBeVisible();
		await expect(screen.findByTestId("InputFee")).resolves.toBeInTheDocument();

		userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "1");

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await expect(reviewStep()).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		if (!profile.settings().get(Contracts.ProfileSetting.DoNotShowFeeWarning)) {
			await expect(screen.findByTestId(feeWarningContinueID)).resolves.toBeVisible();

			userEvent.click(screen.getByTestId(feeWarningContinueID));
		}

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should return to form step by cancelling fee warning", async () => {
		renderPage();

		await expect(formStep()).resolves.toBeVisible();
		await expect(screen.findByTestId("InputFee")).resolves.toBeInTheDocument();

		// Fee
		userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "30");

		await waitFor(() => expect(inputElement).toHaveValue("30"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		userEvent.click(continueButton());

		await expect(reviewStep()).resolves.toBeVisible();

		userEvent.click(continueButton());

		await expect(screen.findByTestId("FeeWarning__cancel-button")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("FeeWarning__cancel-button"));

		await expect(formStep()).resolves.toBeVisible();
	});

	it("should proceed to authentication step by confirming fee warning", async () => {
		renderPage();

		await expect(formStep()).resolves.toBeVisible();
		await expect(screen.findByTestId("InputFee")).resolves.toBeInTheDocument();

		// Fee
		userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "30");

		await waitFor(() => expect(inputElement).toHaveValue("30"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		userEvent.click(continueButton());

		await expect(reviewStep()).resolves.toBeVisible();

		userEvent.click(continueButton());

		await expect(screen.findByTestId("FeeWarning__continue-button")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("FeeWarning__continue-button"));

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();
	});

	it("should show error step and close", async () => {
		const signMock = vi
			.spyOn(wallet.transaction(), "signUsernameResignation")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));

		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockImplementation(() => {
			throw new Error("broadcast error");
		});

		const { publicKey } = await wallet.coin().publicKey().fromMnemonic(MNEMONICS[1]);

		const secondPublicKeyMock = vi.spyOn(wallet, "secondPublicKey").mockReturnValue(publicKey);

		renderPage();
		await expect(screen.findByTestId("InputFee")).resolves.toBeInTheDocument();

		await expect(formStep()).resolves.toBeVisible();

		// Fee
		userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "30");

		await waitFor(() => expect(inputElement).toHaveValue("30"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		userEvent.click(continueButton());

		await expect(reviewStep()).resolves.toBeVisible();

		userEvent.click(continueButton());

		if (!profile.settings().get(Contracts.ProfileSetting.DoNotShowFeeWarning)) {
			await expect(screen.findByTestId(feeWarningContinueID)).resolves.toBeVisible();

			userEvent.click(screen.getByTestId(feeWarningContinueID));
		}

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		await waitFor(() => expect(secondMnemonic()).toBeEnabled());

		userEvent.type(secondMnemonic(), MNEMONICS[1]);
		await waitFor(() => expect(secondMnemonic()).toHaveValue(MNEMONICS[1]));

		await waitFor(() => {
			expect(sendButton()).toBeEnabled();
		});

		userEvent.click(sendButton());

		await waitFor(() => {
			expect(screen.getByTestId("ErrorStep")).toBeInTheDocument();
		});

		expect(screen.getByTestId("ErrorStep__errorMessage")).toHaveTextContent("broadcast error");

		const historyMock = vi.spyOn(history, "push").mockReturnValue();

		userEvent.click(screen.getByTestId("ErrorStep__close-button"));

		const walletDetailPage = `/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}`;
		await waitFor(() => expect(historyMock).toHaveBeenCalledWith(walletDetailPage));

		historyMock.mockRestore();

		secondPublicKeyMock.mockRestore();
		broadcastMock.mockRestore();
		signMock.mockRestore();
	});

	it("should show error step and go back", async () => {
		const signMock = vi
			.spyOn(wallet.transaction(), "signUsernameResignation")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));

		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockImplementation(() => {
			throw new Error("broadcast error");
		});

		const { publicKey } = await wallet.coin().publicKey().fromMnemonic(MNEMONICS[1]);

		const secondPublicKeyMock = vi.spyOn(wallet, "secondPublicKey").mockReturnValue(publicKey);

		renderPage();
		await expect(screen.findByTestId("InputFee")).resolves.toBeInTheDocument();

		await expect(formStep()).resolves.toBeVisible();

		// Fee
		userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "30");

		await waitFor(() => expect(inputElement).toHaveValue("30"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());

		userEvent.click(continueButton());

		await expect(reviewStep()).resolves.toBeVisible();

		userEvent.click(continueButton());

		if (!profile.settings().get(Contracts.ProfileSetting.DoNotShowFeeWarning)) {
			await expect(screen.findByTestId(feeWarningContinueID)).resolves.toBeVisible();

			userEvent.click(screen.getByTestId(feeWarningContinueID));
		}

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		await waitFor(() => expect(secondMnemonic()).toBeEnabled());

		userEvent.type(secondMnemonic(), MNEMONICS[1]);
		await waitFor(() => expect(secondMnemonic()).toHaveValue(MNEMONICS[1]));

		await waitFor(() => {
			expect(sendButton()).toBeEnabled();
		});

		userEvent.click(sendButton());

		await waitFor(() => {
			expect(screen.getByTestId("ErrorStep")).toBeInTheDocument();
		});

		expect(screen.getByTestId("ErrorStep__errorMessage")).toHaveTextContent("broadcast error");

		userEvent.click(screen.getByTestId("ErrorStep__back-button"));

		await expect(formStep()).resolves.toBeVisible();

		secondPublicKeyMock.mockRestore();
		broadcastMock.mockRestore();
		signMock.mockRestore();
	});

	it("should successfully sign and submit resignation transaction", async () => {
		const { publicKey } = await wallet.coin().publicKey().fromMnemonic(MNEMONICS[1]);

		const secondPublicKeyMock = vi.spyOn(wallet, "secondPublicKey").mockReturnValue(publicKey);

		const signMock = vi
			.spyOn(wallet.transaction(), "signUsernameResignation")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		const { asFragment } = renderPage();
		await expect(screen.findByTestId("InputFee")).resolves.toBeInTheDocument();

		await expect(formStep()).resolves.toBeVisible();

		// Fee
		userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "30");

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await expect(formStep()).resolves.toBeVisible();

		userEvent.click(continueButton());

		await expect(reviewStep()).resolves.toBeVisible();

		userEvent.click(continueButton());

		if (!profile.settings().get(Contracts.ProfileSetting.DoNotShowFeeWarning)) {
			await expect(screen.findByTestId(feeWarningContinueID)).resolves.toBeVisible();

			userEvent.click(screen.getByTestId(feeWarningContinueID));
		}
		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		await waitFor(() => {
			expect(secondMnemonic()).toBeEnabled();
		});

		userEvent.paste(secondMnemonic(), MNEMONICS[1]);
		await waitFor(() => expect(secondMnemonic()).toHaveValue(MNEMONICS[1]));

		await waitFor(() => {
			expect(sendButton()).toBeEnabled();
		});

		userEvent.click(sendButton());

		await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		secondPublicKeyMock.mockRestore();
		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
	});

	it("should successfully sign and submit musig resignation transaction", async () => {
		const isMultiSignatureSpy = vi.spyOn(wallet, "isMultiSignature").mockReturnValue(true);
		const multisignatureSpy = vi
			.spyOn(wallet.multiSignature(), "all")
			.mockReturnValue({ min: 2, publicKeys: [wallet.publicKey()!, profile.wallets().last().publicKey()!] });

		const signMock = vi
			.spyOn(wallet.transaction(), "signUsernameResignation")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		const { asFragment } = renderPage();
		await expect(screen.findByTestId("InputFee")).resolves.toBeInTheDocument();

		await expect(formStep()).resolves.toBeVisible();

		// Fee
		userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "30");

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await expect(formStep()).resolves.toBeVisible();

		userEvent.click(continueButton());

		await expect(reviewStep()).resolves.toBeVisible();

		userEvent.click(continueButton());

		if (!profile.settings().get(Contracts.ProfileSetting.DoNotShowFeeWarning)) {
			await expect(screen.findByTestId(feeWarningContinueID)).resolves.toBeVisible();

			userEvent.click(screen.getByTestId(feeWarningContinueID));
		}

		await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		multisignatureSpy.mockRestore();
		isMultiSignatureSpy.mockRestore();
	});

	it("should successfully sign and submit resignation transaction with keyboard", async () => {
		const { publicKey } = await wallet.coin().publicKey().fromMnemonic(MNEMONICS[1]);

		const secondPublicKeyMock = vi.spyOn(wallet, "secondPublicKey").mockReturnValue(publicKey);

		const signMock = vi
			.spyOn(wallet.transaction(), "signUsernameResignation")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		const { asFragment } = renderPage();

		await expect(screen.findByTestId("InputFee")).resolves.toBeInTheDocument();

		await expect(formStep()).resolves.toBeVisible();

		// Fee
		userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "30");

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await expect(formStep()).resolves.toBeVisible();

		userEvent.keyboard("{enter}");

		await expect(reviewStep()).resolves.toBeVisible();

		userEvent.keyboard("{enter}");

		if (!profile.settings().get(Contracts.ProfileSetting.DoNotShowFeeWarning)) {
			await expect(screen.findByTestId(feeWarningContinueID)).resolves.toBeVisible();

			userEvent.click(screen.getByTestId(feeWarningContinueID));
		}

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		await waitFor(() => {
			expect(secondMnemonic()).toBeEnabled();
		});

		userEvent.paste(secondMnemonic(), MNEMONICS[1]);
		await waitFor(() => expect(secondMnemonic()).toHaveValue(MNEMONICS[1]));

		userEvent.keyboard("{enter}");
		userEvent.click(sendButton());

		await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		secondPublicKeyMock.mockRestore();
		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
	});

	it("should back button after successful submission", async () => {
		const { publicKey } = await wallet.coin().publicKey().fromMnemonic(MNEMONICS[1]);

		const secondPublicKeyMock = vi.spyOn(wallet, "secondPublicKey").mockReturnValue(publicKey);

		const signMock = vi
			.spyOn(wallet.transaction(), "signUsernameResignation")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		renderPage();

		await expect(screen.findByTestId("InputFee")).resolves.toBeInTheDocument();

		await expect(formStep()).resolves.toBeVisible();

		// Fee
		userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "30");

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await expect(formStep()).resolves.toBeVisible();

		userEvent.click(continueButton());

		await expect(reviewStep()).resolves.toBeVisible();

		userEvent.click(continueButton());

		if (!profile.settings().get(Contracts.ProfileSetting.DoNotShowFeeWarning)) {
			await expect(screen.findByTestId(feeWarningContinueID)).resolves.toBeVisible();

			userEvent.click(screen.getByTestId(feeWarningContinueID));
		}

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);

		await waitFor(() => {
			expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase);
		});

		await waitFor(() => {
			expect(secondMnemonic()).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(secondMnemonic()).toBeEnabled();
		});

		userEvent.type(secondMnemonic(), MNEMONICS[1]);

		await waitFor(() => {
			expect(secondMnemonic()).toHaveValue(MNEMONICS[1]);
		});

		await waitFor(() => {
			expect(sendButton()).toBeEnabled();
		});

		userEvent.click(sendButton());

		await waitFor(() => {
			expect(screen.getByTestId("TransactionPending")).toBeInTheDocument();
		});

		const historyMock = vi.spyOn(history, "push").mockReturnValue();

		userEvent.click(screen.getByTestId("StepNavigation__back-to-wallet-button"));

		const walletDetailPage = `/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}`;
		await waitFor(() => expect(historyMock).toHaveBeenCalledWith(walletDetailPage));

		historyMock.mockRestore();

		secondPublicKeyMock.mockRestore();
		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
	});

	it("should successfully sign and submit resignation transaction using encryption password", async () => {
		const actsWithMnemonicMock = vi.spyOn(wallet, "actsWithMnemonic").mockReturnValue(false);
		const actsWithWifWithEncryptionMock = vi.spyOn(wallet, "actsWithWifWithEncryption").mockReturnValue(true);
		const wifGetMock = vi.spyOn(wallet.signingKey(), "get").mockReturnValue(passphrase);

		const secondPublicKeyMock = vi.spyOn(wallet, "isSecondSignature").mockReturnValue(false);
		const signMock = vi
			.spyOn(wallet.transaction(), "signUsernameResignation")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));
		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMock(wallet);

		const resignationEncryptedUrl = `/profiles/${getDefaultProfileId()}/wallets/${wallet.id()}/send-delegate-resignation`;
		history.push(resignationEncryptedUrl);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-delegate-resignation">
				<SendUsernameResignation />
			</Route>,
			{
				history,
				route: resignationEncryptedUrl,
			},
		);

		await expect(screen.findByTestId("InputFee")).resolves.toBeInTheDocument();

		await expect(formStep()).resolves.toBeVisible();

		// Fee
		userEvent.click(screen.getByText(transactionTranslations.INPUT_FEE_VIEW_TYPE.ADVANCED));

		const inputElement: HTMLInputElement = screen.getByTestId("InputCurrency");

		inputElement.select();
		userEvent.paste(inputElement, "30");

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await expect(formStep()).resolves.toBeVisible();

		userEvent.click(continueButton());

		await expect(reviewStep()).resolves.toBeVisible();

		userEvent.click(continueButton());

		if (!profile.settings().get(Contracts.ProfileSetting.DoNotShowFeeWarning)) {
			await expect(screen.findByTestId(feeWarningContinueID)).resolves.toBeVisible();

			userEvent.click(screen.getByTestId(feeWarningContinueID));
		}

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__encryption-password"), "password");
		await waitFor(() =>
			expect(screen.getByTestId("AuthenticationStep__encryption-password")).toHaveValue("password"),
		);

		await waitFor(() => expect(sendButton()).not.toBeDisabled());

		userEvent.click(sendButton());

		await expect(screen.findByTestId("TransactionPending")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		secondPublicKeyMock.mockRestore();
		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		actsWithMnemonicMock.mockRestore();
		actsWithWifWithEncryptionMock.mockRestore();
		wifGetMock.mockRestore();
	});
});
