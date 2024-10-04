import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";

import {
	createTransactionMock,
	env,
	getDefaultProfileId, getDefaultWalletMnemonic,
	render,
	screen, syncFees, waitFor
} from "@/utils/testing-library";
import {SendExchangeTransfer} from "./SendExchangeTransfer";
import userEvent from "@testing-library/user-event";
import {afterAll, beforeEach, expect, MockInstance} from "vitest";
import * as environmentHooks from "@/app/hooks/env";
import { server, requestMock } from "@/tests/mocks/server";
import nodeFeesFixture from "@/tests/fixtures/coins/ark/mainnet/node-fees.json";
import transactionFeesFixture from "@/tests/fixtures/coins/ark/mainnet/transaction-fees.json";
import {renderHook, within} from "@testing-library/react";
import transactionFixture from "@/tests/fixtures/coins/ark/devnet/transactions/transfer.json";
import {useTranslation} from "react-i18next";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let exchangeTransaction: Contracts.IExchangeTransaction;

let useActiveProfileSpy: MockInstance

describe("SendExchangeTransfer", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		wallet = profile.wallets().first()

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

	beforeEach(async () => {
		server.use(
			requestMock("https://ark-test-musig.arkvault.io", { result: [] }, { method: "post" }),
		);
	})

	afterAll(() => {
		useActiveProfileSpy.mockRestore();
	})

	const renderComponent = (properties: Record<string, any> = {}) => {
		render(<SendExchangeTransfer
			profile={profile}
			network={profile.wallets().first().network()}
			exchangeTransaction={exchangeTransaction}
			onClose={vi.fn()}
			onSuccess={vi.fn()}
			{...properties}
		/>);
	}

	const sendButton = () => screen.getByTestId("ExchangeTransfer__send-button");

	const selectSender = async () => {
		await userEvent.click(within(screen.getByTestId("sender-address")).getByTestId("SelectAddress__wrapper"));

		await expect(screen.findByText(/Select Sender/)).resolves.toBeVisible();

		const firstAddress = screen.getByTestId("SearchWalletListItem__select-0");

		await userEvent.click(firstAddress);
	}

	it("should trigger `onClose`", async () => {
		const onClose = vi.fn();

		renderComponent({onClose});

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

		// AuthenticationStep should be visible
		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), getDefaultWalletMnemonic());

		await waitFor(() => expect(sendButton()).not.toBeDisabled());

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

		await expect(screen.findByText(t("EXCHANGE.MODAL_SIGN_EXCHANGE_TRANSACTION.SUCCESS_TITLE"))).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
	});
});
