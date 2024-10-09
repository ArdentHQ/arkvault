import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";

import {
	createTransactionMock,
	env,
	getDefaultProfileId,
	getDefaultWalletMnemonic,
	render,
	screen,
	syncFees,
	waitFor,
} from "@/utils/testing-library";
import { SendExchangeTransfer } from "./SendExchangeTransfer";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeEach, expect, MockInstance } from "vitest";
import * as environmentHooks from "@/app/hooks/env";
import { server, requestMock } from "@/tests/mocks/server";
import nodeFeesFixture from "@/tests/fixtures/coins/ark/mainnet/node-fees.json";
import transactionFeesFixture from "@/tests/fixtures/coins/ark/mainnet/transaction-fees.json";
import { renderHook, within } from "@testing-library/react";
import transactionFixture from "@/tests/fixtures/coins/ark/devnet/transactions/transfer.json";
import { useTranslation } from "react-i18next";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let exchangeTransaction: Contracts.IExchangeTransaction;

let useActiveProfileSpy: MockInstance;

const sendButton = () => screen.getByTestId("ExchangeTransfer__send-button");

const selectSender = async () => {
	await userEvent.click(within(screen.getByTestId("sender-address")).getByTestId("SelectAddress__wrapper"));

	await expect(screen.findByText(/Select Sender/)).resolves.toBeVisible();

	const firstAddress = screen.getByTestId("SearchWalletListItem__select-0");

	await userEvent.click(firstAddress);
};

const fillMnemonic = async () => {
	// AuthenticationStep should be visible
	await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

	await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), getDefaultWalletMnemonic());

	await waitFor(() => expect(sendButton()).not.toBeDisabled());
};

describe("SendExchangeTransfer", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		wallet = profile.wallets().first();

		exchangeTransaction = profile.exchangeTransactions().create({
			input: {
				address: "inputAddress",
				amount: 1,
				ticker: "ark",
			},
			orderId: "orderId",
			output: {
				address: "outputAddress",
				amount: 0.005,
				ticker: "eth",
			},
			provider: "provider",
		});

		useActiveProfileSpy = vi.spyOn(environmentHooks, "useActiveProfile").mockImplementation(() => profile);

		server.use(
			requestMock("https://ark-test.arkvault.io/api/node/fees", nodeFeesFixture),
			requestMock("https://ark-test.arkvault.io/api/transactions/fees", transactionFeesFixture),
		);

		await syncFees(profile);
	});

	beforeEach(() => {
		server.use(requestMock("https://ark-test-musig.arkvault.io", { result: [] }, { method: "post" }));
	});

	afterAll(() => {
		useActiveProfileSpy.mockRestore();
	});

	const renderComponent = (properties: Record<string, any> = {}) => {
		render(
			<SendExchangeTransfer
				profile={profile}
				network={profile.wallets().first().network()}
				exchangeTransaction={exchangeTransaction}
				onClose={vi.fn()}
				onSuccess={vi.fn()}
				{...properties}
			/>,
		);
	};

	it("should render", async () => {
		renderComponent();

		// exchangeTransaction->input->address
		await expect(screen.findByText("inputAddress")).resolves.toBeVisible();
	});

	it("should trigger `onClose`", async () => {
		const onClose = vi.fn();

		renderComponent({ onClose });

		await userEvent.click(screen.getByTestId("ExchangeTransfer__cancel-button"));
		expect(onClose).toHaveBeenCalledOnce();
	});

	it("should calculate fee", async () => {
		renderComponent();

		await selectSender();

		await expect(screen.findByText("0.049716 DARK")).resolves.toBeVisible();
	});

	it("should sync wallet if new sender wallet is not restored or synced", async () => {
		const selectedWalletSpy = vi.spyOn(wallet, "hasBeenFullyRestored").mockReturnValue(false);

		const walletSyncSpy = vi.spyOn(wallet.synchroniser(), "identity");

		renderComponent();

		await selectSender();

		expect(walletSyncSpy).toHaveBeenCalledWith();

		selectedWalletSpy.mockRestore();
		walletSyncSpy.mockRestore();
	});

	it("should send a transaction and show a success message", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		renderComponent();

		await selectSender();

		await fillMnemonic();

		const signMock = vi
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));

		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});

		const transactionMock = createTransactionMock(wallet);

		// Send transaction
		await userEvent.click(sendButton());

		await expect(
			screen.findByText(t("EXCHANGE.MODAL_SIGN_EXCHANGE_TRANSACTION.SUCCESS_TITLE")),
		).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
	});

	it("should show an error if wallet does not have enough funds", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const selectedWalletSpy = vi.spyOn(wallet, "balance").mockReturnValue(0.04);

		renderComponent();

		await selectSender();

		await expect(screen.findByTestId("Input__error")).resolves.toBeVisible();

		expect(screen.getByTestId("Input__error")).toHaveAttribute(
			"data-errortext",
			t("TRANSACTION.VALIDATION.LOW_BALANCE"),
		);

		selectedWalletSpy.mockRestore();
	});

	it("should handle an error when sending a transaction", async () => {
		renderComponent();

		await selectSender();

		await fillMnemonic();

		const signMock = vi.spyOn(wallet.transaction(), "signTransfer").mockImplementation(() => {
			throw new Error("broadcast error");
		});

		await userEvent.click(sendButton());

		await expect(screen.findByText(/broadcast error/)).resolves.toBeVisible();

		signMock.mockRestore();
	});

	it("should prefill sender wallet if there is only one wallet in profile", async () => {
		const secondWallet = profile.wallets().values()[1];

		profile.wallets().forget(secondWallet.id());

		renderComponent();

		await waitFor(() => {
			expect(screen.getByTestId("SelectAddress__input")).toHaveValue(wallet.address());
		});

		profile.wallets().push(secondWallet);
	});

	it("should trigger `onSuccess`", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const onSuccessMock = vi.fn();

		renderComponent({ onSuccess: onSuccessMock });

		await selectSender();

		await fillMnemonic();

		const signMock = vi
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.id));

		const broadcastMock = vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});

		const transactionMock = createTransactionMock(wallet);

		// Send transaction
		await userEvent.click(sendButton());

		await expect(
			screen.findByText(t("EXCHANGE.MODAL_SIGN_EXCHANGE_TRANSACTION.SUCCESS_TITLE")),
		).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("ExchangeTransfer__continue"));

		expect(onSuccessMock).toHaveBeenCalledOnce();
		expect(onSuccessMock).toHaveBeenCalledWith("8f913b6b719e7767d49861c0aec79ced212767645cb793d75d2f1b89abb49877");

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
	});
});
