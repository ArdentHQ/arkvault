/* eslint-disable max-lines-per-function */
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { SendUsernameResignation } from "./SendUsernameResignation";
import transactionFixture from "@/tests/fixtures/coins/ark/devnet/transactions/transfer.json";
import {
	env,
	getMainsailProfileId,
	render,
	screen,
	syncDelegates,
	syncFees,
	waitFor,
	MNEMONICS_MAINSAIL as MNEMONICS,
} from "@/utils/testing-library";
import * as useFeesHook from "@/app/hooks/use-fees";
import { BigNumber } from "@ardenthq/sdk-helpers";

let wallet: Contracts.IReadWriteWallet;
let profile: Contracts.IProfile;

let resignationUrl: string;

const passphrase = MNEMONICS[0];
const history = createHashHistory();

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
const fees = { avg: 25, isDynamic: false, max: 25, min: 25, static: 25 };

describe("SendUsernameResignation", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().push(
			await profile.walletFactory().fromMnemonicWithBIP39({
				coin: "Mainsail",
				mnemonic: passphrase,
				network: "mainsail.devnet",
			}),
		);

		vi.spyOn(wallet, "publicKey").mockReturnValue("03f25455408f9a7e6c6a056b121e68fbda98f3511d22e9ef27b0ebaf1ef9e4eabc")
		vi.spyOn(wallet, "username").mockReturnValue("genesis_1")
		vi.spyOn(wallet, "balance").mockReturnValue(BigNumber.make('100000'))
		vi.spyOn(wallet, "nonce").mockReturnValue(BigNumber.make('10'))
		vi.spyOn(wallet, "isMultiSignature").mockReturnValue(false)
		vi.spyOn(wallet, "isSecondSignature").mockReturnValue(false)

		await wallet.synchroniser().identity();

		await syncDelegates(profile);
		await syncFees(profile);

		vi.spyOn(useFeesHook, "useFees").mockReturnValue({
			calculate: () => Promise.resolve(fees),
		});
	});

	beforeEach(() => {
		resignationUrl = `/profiles/${getMainsailProfileId()}/wallets/${wallet.id()}/send-username-resignation`;
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
		const isSecondSignatureMock = vi.spyOn(wallet, "isSecondSignature").mockReturnValue(true);

		const { asFragment } = renderPage();

		await expect(formStep()).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).toBeEnabled());

		userEvent.click(continueButton());

		await expect(reviewStep()).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

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
		isSecondSignatureMock.mockRestore();
	});

	it("should render 1st step", async () => {
		const { asFragment } = renderPage();

		await expect(formStep()).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render 2nd step", async () => {
		const { asFragment } = renderPage();

		await expect(formStep()).resolves.toBeVisible();

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

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await expect(reviewStep()).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("StepNavigation__back-button"));

		await expect(formStep()).resolves.toBeVisible();
	});

	it("should render 3rd step", async () => {
		const { asFragment } = renderPage();

		await expect(formStep()).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).toBeEnabled());

		userEvent.click(continueButton());

		await expect(reviewStep()).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).toBeEnabled());

		userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
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

		await waitFor(() => expect(continueButton()).toBeDisabled());

		await waitFor(() => expect(continueButton()).toBeEnabled());

		userEvent.click(continueButton());

		await expect(reviewStep()).resolves.toBeVisible();

		userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

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

		await waitFor(() => expect(continueButton()).toBeDisabled());

		await waitFor(() => expect(continueButton()).toBeEnabled());

		userEvent.click(continueButton());

		await expect(reviewStep()).resolves.toBeVisible();

		userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

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

		const walletDetailPage = `/profiles/${getMainsailProfileId()}/wallets/${wallet.id()}`;
		await waitFor(() => expect(historyMock).toHaveBeenCalledWith(walletDetailPage));

		historyMock.mockRestore();

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

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await expect(formStep()).resolves.toBeVisible();

		userEvent.click(continueButton());

		await expect(reviewStep()).resolves.toBeVisible();

		userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

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
			.mockResolvedValue(transactionFixture.data.id);

		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});

		const signatory = await wallet.signatoryFactory().make({
			mnemonic: passphrase,
		});

		const transactionMock = createTransactionMock(wallet);

		const signatoryMock = vi.spyOn(wallet.signatoryFactory(), "make").mockResolvedValue(signatory);

		renderPage();

		await expect(formStep()).resolves.toBeVisible();

		userEvent.click(continueButton());

		await expect(reviewStep()).resolves.toBeVisible();

		await waitFor(() => expect(continueButton()).toBeEnabled());
		userEvent.click(continueButton());

		await expect(screen.findByTestId("TransactionFee")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		multisignatureSpy.mockRestore();
		isMultiSignatureSpy.mockRestore();
		signatoryMock.mockRestore();
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

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await expect(formStep()).resolves.toBeVisible();

		userEvent.keyboard("{enter}");

		await expect(reviewStep()).resolves.toBeVisible();

		userEvent.keyboard("{enter}");

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.paste(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

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

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await expect(formStep()).resolves.toBeVisible();

		userEvent.click(continueButton());

		await expect(reviewStep()).resolves.toBeVisible();

		userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);

		await waitFor(() => {
			expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase);
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

		const walletDetailPage = `/profiles/${getMainsailProfileId()}/wallets/${wallet.id()}`;
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

		const resignationEncryptedUrl = `/profiles/${getMainsailProfileId()}/wallets/${wallet.id()}/send-delegate-resignation`;
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

		await waitFor(() => expect(continueButton()).toBeEnabled());

		await expect(formStep()).resolves.toBeVisible();

		userEvent.click(continueButton());

		await expect(reviewStep()).resolves.toBeVisible();

		userEvent.click(continueButton());

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
