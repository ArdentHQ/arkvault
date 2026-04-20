import React from "react";
import { Contracts } from "@/app/lib/profiles";

import {
	env,
	mockNanoXTransport,
	mockLedgerTransportError,
	render,
	screen,
	syncFees,
	getMainsailProfileId,
	createTransactionMock,
} from "@/utils/testing-library";
import { SendExchangeTransfer } from "./SendExchangeTransfer";
import { afterAll, expect, MockInstance } from "vitest";
import * as environmentHooks from "@/app/hooks/env";
import { renderHook } from "@testing-library/react";
import transactionFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/transfer.json";
import { useTranslation } from "react-i18next";
let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let exchangeTransaction: Contracts.IExchangeTransaction;

let useActiveProfileSpy: MockInstance;

describe("SendExchangeTransfer", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

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

		await syncFees(profile);
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

	it("should render ledger authentication screen", async () => {
		vi.spyOn(wallet, "isLedger").mockImplementation(() => true);
		vi.spyOn(wallet.ledger(), "isNanoX").mockResolvedValue(true);
		const connectMock = vi.spyOn(wallet.ledger(), "connect").mockResolvedValue(true);
		const versionMock = vi.spyOn(wallet.ledger(), "getVersion").mockResolvedValue("2.1.0");
		const isEthBasedAppMock = vi.spyOn(wallet.ledger(), "isEthBasedApp").mockImplementation(() => true);

		const mockWalletData = vi.spyOn(wallet.data(), "get").mockImplementation((key) => {
			if (key === Contracts.WalletData.DerivationPath) {
				return "m/44'/1'/1'/0/0";
			}

			if (key === Contracts.WalletData.Address) {
				return "0x393f3F74F0cd9e790B5192789F31E0A38159ae03";
			}

			if (key === Contracts.WalletData.Balance) {
				return 1_000_000_000_000_000_000;
			}
		});

		const profileWalletsCountMock = vi.spyOn(profile.wallets(), "count").mockReturnValue(1);
		const profileWalletsMock = vi.spyOn(profile.wallets(), "values").mockReturnValue([wallet]);

		const ledgerGetPublicKeyMock = vi
			.spyOn(wallet.ledger(), "getPublicKey")
			.mockResolvedValue("0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb");

		const transportMock = mockNanoXTransport();

		createTransactionMock(wallet);
		vi.spyOn(wallet.transaction(), "signTransfer").mockReturnValue(Promise.resolve(transactionFixture.data.id));

		vi.spyOn(wallet.ledger(), "scan").mockImplementation(({ onProgress }) => {
			onProgress(wallet);
			return {
				"m/44'/1'/0'/0/0": wallet.toData(),
			};
		});

		vi.spyOn(wallet.transaction(), "broadcast").mockResolvedValue({
			accepted: [transactionFixture.data.id],
			errors: {},
			rejected: [],
		});

		renderComponent();
		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();
		profileWalletsMock.mockRestore();
		profileWalletsCountMock.mockRestore();
		versionMock.mockRestore();
		connectMock.mockRestore();
		mockWalletData.mockRestore();
		transportMock.mockRestore();
		ledgerGetPublicKeyMock.mockRestore();
		isEthBasedAppMock.mockRestore();
	});

	it("should show error if unable to detect ledger device", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const isLedgerMock = vi.spyOn(wallet, "isLedger").mockImplementation(() => true);
		const isEthBasedAppMock = vi.spyOn(wallet.ledger(), "isEthBasedApp").mockImplementation(() => true);

		const ledgerErrorMock = mockLedgerTransportError("Access denied to use Ledger device");
		const profileWalletsCountMock = vi.spyOn(profile.wallets(), "count").mockReturnValue(1);
		const profileWalletsMock = vi.spyOn(profile.wallets(), "values").mockReturnValue([wallet]);

		renderComponent();

		await expect(screen.findByTestId("ErrorState")).resolves.toBeVisible();
		await expect(screen.findByText(t("WALLETS.MODAL_LEDGER_WALLET.DEVICE_NOT_AVAILABLE"))).resolves.toBeVisible();

		ledgerErrorMock.mockRestore();
		isLedgerMock.mockRestore();
		profileWalletsMock.mockRestore();
		profileWalletsCountMock.mockRestore();
		isEthBasedAppMock.mockRestore();
	});

	it("should show browser compatibility error ledger is not supported", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		vi.spyOn(wallet, "isLedger").mockImplementation(() => true);
		vi.spyOn(wallet.ledger(), "isNanoX").mockResolvedValue(true);

		vi.spyOn(wallet.ledger(), "getPublicKey").mockResolvedValue(
			"0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb",
		);

		vi.spyOn(wallet.ledger(), "scan").mockImplementation(({ onProgress }) => {
			onProgress(wallet);
			return {
				"m/44'/1'/0'/0/0": wallet.toData(),
			};
		});

		vi.spyOn(profile.wallets(), "count").mockReturnValue(1);
		vi.spyOn(profile.wallets(), "values").mockReturnValue([wallet]);
		mockNanoXTransport();

		process.env.REACT_APP_IS_UNIT = null;
		window.navigator.usb = undefined;

		renderComponent();

		await expect(screen.findByText(t("WALLETS.MODAL_LEDGER_WALLET.COMPATIBILITY_ERROR"))).resolves.toBeVisible();
	});

	it("should handle ledger submission error", async () => {
		const isNanoXMock = vi.spyOn(wallet.ledger(), "isNanoX").mockResolvedValue(true);
		const isLedgerMock = vi.spyOn(wallet, "isLedger").mockImplementation(() => true);

		const ledgerErrorMock = mockLedgerTransportError("error");
		const profileWalletsMock = vi.spyOn(profile.wallets(), "values").mockReturnValue([wallet]);

		vi.spyOn(wallet.ledger(), "getPublicKey").mockResolvedValue(
			"0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb",
		);

		vi.spyOn(wallet.ledger(), "scan").mockImplementation(({ onProgress }) => {
			onProgress(wallet);
			return {
				"m/44'/1'/0'/0/0": wallet.toData(),
			};
		});

		renderComponent();

		await expect(screen.findByTestId("ErrorState")).resolves.toBeVisible();

		ledgerErrorMock.mockRestore();
		isLedgerMock.mockRestore();
		profileWalletsMock.mockRestore();
		isNanoXMock.mockRestore();
	});
});
