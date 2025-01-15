import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";

import {
	env,
	getDefaultProfileId,
	mockNanoXTransport,
	mockLedgerTransportError,
	render,
	screen,
	syncFees,
} from "@/utils/testing-library";
import { SendExchangeTransfer } from "./SendExchangeTransfer";
import { afterAll, beforeEach, expect, MockInstance } from "vitest";
import * as environmentHooks from "@/app/hooks/env";
import { server, requestMock } from "@/tests/mocks/server";
import nodeFeesFixture from "@/tests/fixtures/coins/ark/mainnet/node-fees.json";
import transactionFeesFixture from "@/tests/fixtures/coins/ark/mainnet/transaction-fees.json";
import { renderHook } from "@testing-library/react";
import transactionFixture from "@/tests/fixtures/coins/ark/devnet/transactions/transfer.json";
import { useTranslation } from "react-i18next";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let exchangeTransaction: Contracts.IExchangeTransaction;

let useActiveProfileSpy: MockInstance;

// const selectSender = async () => {
// 	await userEvent.click(within(screen.getByTestId("sender-address")).getByTestId("SelectAddress__wrapper"));
//
// 	await expect(screen.findByText(/Select Sender/)).resolves.toBeVisible();
//
// 	const firstAddress = screen.getByTestId("SearchWalletListItem__select-0");
//
// 	await userEvent.click(firstAddress);
// };

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

	// @TODO enable tests once Mainsail test setup is done
	// it("should render ledger authentication screen", async () => {
	// 	vi.spyOn(wallet, "isLedger").mockImplementation(() => true);
	// 	vi.spyOn(wallet.coin(), "__construct").mockImplementation(vi.fn());
	// 	vi.spyOn(wallet.ledger(), "isNanoX").mockResolvedValue(true);
	// 	const connectMock = vi.spyOn(wallet.ledger(), "connect").mockResolvedValue(true);
	// 	const versionMock = vi.spyOn(wallet.coin().ledger(), "getVersion").mockResolvedValue("2.1.0");
	//
	// 	const profileWalletsMock = vi.spyOn(profile.wallets(), "findByCoinWithNetwork").mockReturnValue([wallet]);
	// 	vi.spyOn(wallet.coin().ledger(), "getPublicKey").mockResolvedValue(
	// 		"0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb",
	// 	);
	//
	// 	mockNanoXTransport();
	//
	// 	createTransactionMock(wallet);
	// 	vi.spyOn(wallet.transaction(), "signTransfer").mockReturnValue(Promise.resolve(transactionFixture.data.id));
	//
	// 	vi.spyOn(wallet.coin().ledger(), "scan").mockImplementation(({ onProgress }) => {
	// 		onProgress(wallet);
	// 		return {
	// 			"m/44'/1'/0'/0/0": wallet.toData(),
	// 		};
	// 	});
	//
	// 	vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
	// 		accepted: [transactionFixture.data.id],
	// 		errors: {},
	// 		rejected: [],
	// 	});
	//
	// 	renderComponent();
	//
	// 	await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();
	// 	profileWalletsMock.mockRestore();
	// 	versionMock.mockRestore();
	// 	connectMock.mockRestore();
	// });

	// it("should handle ledger submission error", async () => {
	// 	vi.spyOn(wallet, "isLedger").mockImplementation(() => true);
	// 	vi.spyOn(wallet.coin(), "__construct").mockImplementation(vi.fn());
	// 	vi.spyOn(wallet.ledger(), "isNanoX").mockResolvedValue(true);
	// 	const connectMock = vi.spyOn(wallet.ledger(), "connect").mockResolvedValue(true);
	// 	const versionMock = vi.spyOn(wallet.coin().ledger(), "getVersion").mockResolvedValue("2.1.0");
	//
	// 	vi.spyOn(wallet.coin().ledger(), "getPublicKey").mockResolvedValue(
	// 		"0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb",
	// 	);
	//
	// 	mockNanoXTransport();
	//
	// 	createTransactionMock(wallet);
	// 	vi.spyOn(wallet.transaction(), "signTransfer").mockReturnValue(Promise.resolve(transactionFixture.data.id));
	//
	// 	vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
	// 		accepted: [transactionFixture.data.id],
	// 		errors: {},
	// 		rejected: [],
	// 	});
	//
	// 	renderComponent();
	// 	await selectSender();
	// 	await expect(screen.findByTestId("ErrorState")).resolves.toBeVisible();
	// 	versionMock.mockRestore();
	// 	connectMock.mockRestore();
	// });

	it("should show error if unable to detect ledger device", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		vi.spyOn(wallet, "isLedger").mockImplementation(() => true);

		const ledgerErrorMock = mockLedgerTransportError("Access denied to use Ledger device");
		vi.spyOn(profile.wallets(), "findByCoinWithNetwork").mockReturnValue([wallet]);

		renderComponent();

		await expect(screen.findByText(t("WALLETS.MODAL_LEDGER_WALLET.DEVICE_NOT_AVAILABLE"))).resolves.toBeVisible();

		ledgerErrorMock.mockRestore();
	});

	it("should show browser compatibility error ledger is not supported", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		vi.spyOn(wallet, "isLedger").mockImplementation(() => true);
		vi.spyOn(wallet.ledger(), "isNanoX").mockResolvedValue(true);

		vi.spyOn(wallet.coin().ledger(), "getPublicKey").mockResolvedValue(
			"0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb",
		);

		vi.spyOn(wallet.transaction(), "signTransfer").mockReturnValue(Promise.resolve(transactionFixture.data.id));

		vi.spyOn(wallet.coin().ledger(), "scan").mockImplementation(({ onProgress }) => {
			onProgress(wallet);
			return {
				"m/44'/1'/0'/0/0": wallet.toData(),
			};
		});

		vi.spyOn(profile.wallets(), "findByCoinWithNetwork").mockReturnValue([wallet]);
		mockNanoXTransport();

		process.env.REACT_APP_IS_UNIT = null;
		window.navigator.usb = undefined;

		renderComponent();

		await expect(screen.findByText(t("WALLETS.MODAL_LEDGER_WALLET.COMPATIBILITY_ERROR"))).resolves.toBeVisible();
	});
});
