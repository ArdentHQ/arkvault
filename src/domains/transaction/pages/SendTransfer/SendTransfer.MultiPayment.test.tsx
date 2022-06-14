/* eslint-disable @typescript-eslint/require-await */
import "jest-extended";

import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import nock from "nock";
import React from "react";
import { Route } from "react-router-dom";

import { SendTransfer } from "./SendTransfer";
import { LedgerProvider } from "@/app/contexts";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import transactionFixture from "@/tests/fixtures/coins/ark/devnet/transactions/transfer.json";
import transactionMultipleFixture from "@/tests/fixtures/coins/ark/devnet/transactions/transfer-multiple.json";
import {
	env,
	getDefaultProfileId,
	getDefaultWalletMnemonic,
	render,
	screen,
	syncFees,
	waitFor,
	within,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";

jest.setTimeout(20_000);

const passphrase = getDefaultWalletMnemonic();
const fixtureProfileId = getDefaultProfileId();

const createTransactionMultipleMock = (wallet: Contracts.IReadWriteWallet) =>
	jest.spyOn(wallet.transaction(), "transaction").mockReturnValue({
		amount: () => +transactionMultipleFixture.data.amount / 1e8,
		data: () => ({ data: () => transactionMultipleFixture.data }),
		explorerLink: () => `https://test.arkscan.io/transaction/${transactionFixture.data.id}`,
		fee: () => +transactionMultipleFixture.data.fee / 1e8,
		id: () => transactionMultipleFixture.data.id,
		isMultiSignatureRegistration: () => false,
		recipient: () => transactionMultipleFixture.data.recipient,
		recipients: () => [
			{
				address: transactionMultipleFixture.data.recipient,
				amount: +transactionMultipleFixture.data.amount / 1e8,
			},
		],
		sender: () => transactionMultipleFixture.data.sender,
		type: () => "multiPayment",
		usesMultiSignature: () => false,
	} as any);

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let mockProfileNetworkReset: () => void;

const selectFirstRecipient = () => userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));
const selectRecipient = () =>
	userEvent.click(within(screen.getByTestId("recipient-address")).getByTestId("SelectRecipient__select-recipient"));
const continueButton = () => screen.getByTestId("StepNavigation__continue-button");
const sendButton = () => screen.getByTestId("StepNavigation__send-button");

const reviewStepID = "SendTransfer__review-step";
const formStepID = "SendTransfer__form-step";

const history = createHashHistory();

jest.setTimeout(10_000);

describe("SendTransfer MultiPayment", () => {
	beforeAll(async () => {
		profile = env.profiles().findById("b999d134-7a24-481e-a95d-bc47c543bfc9");

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();

		profile.coins().set("ARK", "ark.devnet");

		nock.disableNetConnect();

		nock("https://ark-test.arkvault.io")
			.get("/api/transactions?address=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD")
			.reply(200, require("tests/fixtures/coins/ark/devnet/transactions.json"))
			.get("/api/transactions?page=1&limit=20&senderId=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD")
			.reply(200, { data: [], meta: {} })
			.get("/api/transactions/8f913b6b719e7767d49861c0aec79ced212767645cb793d75d2f1b89abb49877")
			.reply(200, () => require("tests/fixtures/coins/ark/devnet/transactions.json"))
			.get("/api/wallets/DFJ5Z51F1euNNdRUQJKQVdG4h495LZkc6T")
			.reply(200, require("tests/fixtures/coins/ark/devnet/wallets/DFJ5Z51F1euNNdRUQJKQVdG4h495LZkc6T.json"))
			.get("/api/wallets/DDA5nM7KEqLeTtQKv5qGgcnc6dpNBKJNTS")
			.reply(200, require("tests/fixtures/coins/ark/devnet/wallets/D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb.json"));

		await syncFees(profile);
	});

	beforeEach(() => {
		mockProfileNetworkReset = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		mockProfileNetworkReset();
	});

	it("should send a multi payment", async () => {
		const transferURL = `/profiles/${fixtureProfileId}/wallets/${wallet.id()}/send-transfer`;

		history.push(transferURL);

		render(
			<Route path="/profiles/:profileId/wallets/:walletId/send-transfer">
				<LedgerProvider>
					<SendTransfer />
				</LedgerProvider>
			</Route>,
			{
				history,
				route: transferURL,
			},
		);

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await waitFor(() => {
			expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address());
		});

		// Select multiple type
		userEvent.click(screen.getByText(transactionTranslations.MULTIPLE));

		selectRecipient();

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		selectFirstRecipient();
		await waitFor(() =>
			expect(screen.getAllByTestId("SelectDropdown__input")[1]).toHaveValue(profile.wallets().first().address()),
		);

		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		userEvent.click(screen.getByTestId("AddRecipient__add-button"));
		await waitFor(() => expect(screen.getAllByTestId("AddRecipientItem")).toHaveLength(1));

		selectRecipient();

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		selectFirstRecipient();

		await waitFor(() =>
			expect(screen.getAllByTestId("SelectDropdown__input")[1]).toHaveValue(profile.wallets().first().address()),
		);

		userEvent.paste(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		userEvent.click(screen.getByTestId("AddRecipient__add-button"));
		await waitFor(() => expect(screen.getAllByTestId("AddRecipientItem")).toHaveLength(2));

		// Fee
		userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.1");

		// Step 2
		expect(continueButton()).not.toBeDisabled();

		userEvent.click(continueButton());

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		// Step 3
		expect(continueButton()).not.toBeDisabled();

		userEvent.click(continueButton());

		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		const passwordInput = screen.getByTestId("AuthenticationStep__mnemonic");
		userEvent.paste(passwordInput, passphrase);
		await waitFor(() => expect(passwordInput).toHaveValue(passphrase));

		const signMock = jest
			.spyOn(wallet.transaction(), "signMultiPayment")
			.mockReturnValue(Promise.resolve(transactionMultipleFixture.data.id));
		const broadcastMock = jest.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});
		const transactionMock = createTransactionMultipleMock(wallet);

		await waitFor(() => expect(sendButton()).not.toBeDisabled());
		userEvent.click(sendButton());

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
	});
});
