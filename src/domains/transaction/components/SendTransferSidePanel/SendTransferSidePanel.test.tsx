import * as useConfirmedTransactionMock from "@/domains/transaction/components/TransactionSuccessful/hooks/useConfirmedTransaction";

import { Contracts, DTO } from "@/app/lib/profiles";
import {
	env,
	getDefaultProfileId,
	getDefaultWalletMnemonic,
	render,
	screen,
	syncFees,
	waitFor,
	within,
	getMainsailProfileId,
} from "@/utils/testing-library";
import React from "react";
import { requestMock, server } from "@/tests/mocks/server";

import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import { SendTransferSidePanel } from "./SendTransferSidePanel";
import transactionFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/transfer.json";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import userEvent from "@testing-library/user-event";
import * as LedgerTransportFactory from "@/app/contexts/Ledger/transport";
import * as AppContexts from "@/app/contexts";
import * as hooks from "@/domains/transaction/hooks";
import * as unconfirmedHook from "@/domains/transaction/hooks/use-unconfirmed-transactions";
import * as appHooks from "@/app/hooks";
import * as ReactRouter from "react-router";

const passphrase = getDefaultWalletMnemonic();
const fixtureProfileId = getDefaultProfileId();

const signedTransactionMock = {
	blockHash: () => {},
	confirmations: () => BigNumber.ZERO,
	convertedAmount: () => +transactionFixture.data.value / 1e8,
	convertedFee: () => {
		const fee = BigNumber.make(transactionFixture.data.gasPrice).times(transactionFixture.data.gas).dividedBy(1e8);
		return fee.toNumber();
	},
	convertedTotal: () => BigNumber.ZERO,
	data: () => transactionFixture.data,
	explorerLink: () => `https://test.arkscan.io/transaction/${transactionFixture.data.hash}`,
	explorerLinkForBlock: () => {},
	fee: () => BigNumber.make(transactionFixture.data.gasPrice).times(transactionFixture.data.gas),
	from: () => transactionFixture.data.from,
	gasLimit: () => transactionFixture.data.gasLimit,
	gasUsed: () => transactionFixture.data.receipt.gasUsed,
	hash: () => transactionFixture.data.hash,
	isConfirmed: () => false,
	isMultiPayment: () => false,
	isMultiSignatureRegistration: () => false,
	isReturn: () => false,
	isSecondSignature: () => false,
	isSent: () => true,
	isSuccess: () => true,
	isTransfer: () => true,
	isUnvote: () => false,
	isUpdateValidator: () => false,
	isUsernameRegistration: () => false,
	isUsernameResignation: () => false,
	isValidatorRegistration: () => false,
	isValidatorResignation: () => false,
	isVote: () => false,
	isVoteCombination: () => false,
	memo: () => transactionFixture.data.memo || undefined,
	nonce: () => BigNumber.make(transactionFixture.data.nonce),
	payments: () => [],
	recipients: () => [
		{
			address: transactionFixture.data.to,
			amount: +transactionFixture.data.value / 1e8,
		},
	],
	timestamp: () => DateTime.make(transactionFixture.data.timestamp),
	to: () => transactionFixture.data.to,
	total: () => {
		const value = BigNumber.make(transactionFixture.data.value);
		const feeVal = BigNumber.make(transactionFixture.data.gasPrice).times(transactionFixture.data.gas);
		return value.plus(feeVal);
	},
	type: () => "transfer",
	usesMultiSignature: () => false,
	value: () => +transactionFixture.data.value / 1e8,
	wallet: () => wallet,
} as DTO.ExtendedSignedTransactionData;

const createTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue(signedTransactionMock);

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;
let firstWalletAddress: string;

const selectFirstRecipient = () => userEvent.click(screen.getByTestId("RecipientListItem__select-button-0"));
const selectRecipient = () =>
	userEvent.click(within(screen.getByTestId("recipient-address")).getByTestId("SelectRecipient__select-recipient"));

const continueButton = () => screen.getByTestId("SendTransfer__continue-button");
const sendButton = () => screen.getByTestId("SendTransfer__send-button");
const reviewStepID = "SendTransfer__review-step";
const formStepID = "SendTransfer__form-step";

// Select sender address via shared SelectAddressDropdown
const selectNthSenderAddress = async (index = 0) => {
	const container = screen.getByTestId("sender-address");
	await userEvent.click(within(container).getByTestId("SelectDropdown__input"));

	const elementTestId = `SelectDropdown__option--${index}`;

	await waitFor(() => {
		expect(screen.getByTestId(elementTestId)).toBeInTheDocument();
	});

	await userEvent.click(screen.getByTestId(elementTestId));
};

const selectFirstSenderAddress = async () => selectNthSenderAddress(0);

describe("SendTransferSidePanel", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();

		const { wallet: arkMainnetWallet } = await profile
			.walletFactory()
			.generate({ coin: "Mainsail", network: "mainsail.mainnet" });
		profile.wallets().push(arkMainnetWallet);

		firstWalletAddress = wallet.address();

		await syncFees(profile);

		server.use(
			requestMock(
				`https://dwallets-evm.mainsailhq.com/api/transactions/${transactionFixture.data.hash}`,
				transactionFixture,
			),
		);
	});

	beforeEach(() => {
		vi.spyOn(ReactRouter, "useSearchParams").mockReturnValue([new URLSearchParams(), vi.fn()]);

		vi.spyOn(wallet, "balance").mockReturnValue(1_000_000_000_000_000_000);

		vi.spyOn(useConfirmedTransactionMock, "useConfirmedTransaction").mockReturnValue({
			confirmations: 10,
			isConfirmed: true,
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should send a single transfer via side panel", async () => {
		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		// Select a valid sender address before proceeding
		await selectFirstSenderAddress();

		await selectRecipient();
		await expect(screen.findByTestId("Modal__inner")).resolves.toBeInTheDocument();
		await selectFirstRecipient();
		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress));

		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled(), { interval: 5 });
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());
		await userEvent.click(document.body);

		expect(screen.getAllByRole("radio")[0]).toHaveTextContent("0.000126");

		expect(continueButton()).not.toBeDisabled();
		await userEvent.click(continueButton());
		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		const signMock = vi
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.hash));
		const broadcastMock = vi
			.spyOn(wallet.transaction(), "broadcast")
			.mockResolvedValue({ accepted: [transactionFixture.data.hash], errors: {}, rejected: [] });
		const transactionMock = createTransactionMock(wallet);

		await waitFor(() => expect(sendButton()).not.toBeDisabled(), { interval: 10 });
		await userEvent.click(sendButton());

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
	});

	it("should advance to ReviewStep on Enter when form valid and focus is not a button", async () => {
		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await selectFirstSenderAddress();
		await selectRecipient();
		await expect(screen.findByTestId("Modal__inner")).resolves.toBeInTheDocument();
		await selectFirstRecipient();
		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress));

		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.keyboard("{Enter}");

		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();
	});

	it("should do nothing on Enter when focus is on a button", async () => {
		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		screen.getByTestId("SendTransfer__back-button").focus();
		await userEvent.keyboard("{Enter}");

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();
	});

	it("should do nothing on Enter when next is disabled (invalid form)", async () => {
		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await userEvent.keyboard("{Enter}");

		expect(screen.getByTestId(formStepID)).toBeInTheDocument();
	});

	it("should do nothing on Enter when at or past AuthenticationStep", async () => {
		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();
		await selectFirstSenderAddress();
		await selectRecipient();
		await expect(screen.findByTestId("Modal__inner")).resolves.toBeInTheDocument();
		await selectFirstRecipient();
		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress));

		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await userEvent.click(continueButton());
		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.keyboard("{Enter}");
		expect(screen.getByTestId("AuthenticationStep")).toBeInTheDocument();
	});

	it("should confirm unconfirmed modal and proceed to summary", async () => {
		server.use(
			requestMock(
				`https://dwallets-evm.mainsailhq.com/api/transactions/8e4a8c3eaf2f9543a5bd61bb85ddd2205d5091597a77446c8b99692e0854b978`,
				transactionFixture,
			),
		);

		const useTransactionSpy = vi.spyOn(hooks, "useTransaction").mockReturnValue({
			fetchWalletUnconfirmedTransactions: vi.fn().mockResolvedValue([signedTransactionMock]),
		} as any);

		vi.spyOn(unconfirmedHook, "useUnconfirmedTransactions").mockReturnValue({
			addUnconfirmedTransactionFromSigned: vi.fn(),
		} as any);

		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await selectFirstSenderAddress();
		await selectRecipient();
		await expect(screen.findByTestId("Modal__inner")).resolves.toBeInTheDocument();
		await selectFirstRecipient();
		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress));

		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled(), { interval: 5 });
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		await userEvent.click(continueButton());
		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		const signMock = vi
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.hash));
		const broadcastMock = vi
			.spyOn(wallet.transaction(), "broadcast")
			.mockResolvedValue({ accepted: [transactionFixture.data.hash], errors: {}, rejected: [] });
		const transactionMock = createTransactionMock(wallet);

		await userEvent.click(sendButton());

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();
		await userEvent.click(screen.getByTestId("ConfirmSendTransaction__confirm"));

		await waitFor(() => expect(screen.getByTestId("SendTransfer__close-button")).toBeVisible());

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		useTransactionSpy.mockRestore();
	});

	it("should connect ledger and auto submit when moving to AuthenticationStep", async () => {
		server.use(
			requestMock(
				`https://dwallets-evm.mainsailhq.com/api/transactions/8e4a8c3eaf2f9543a5bd61bb85ddd2205d5091597a77446c8b99692e0854b978`,
				transactionFixture,
			),
			requestMock(`https://dwallets-evm.mainsailhq.com/api/blocks*`, { data: {} }),
		);

		const transportSpy = vi.spyOn(LedgerTransportFactory, "isLedgerTransportSupported").mockReturnValue(true);
		const connectMock = vi.fn().mockResolvedValue(undefined);
		const ledgerCtxSpy = vi.spyOn(AppContexts, "useLedgerContext").mockReturnValue({
			connect: connectMock,
			hasDeviceAvailable: true,
			isConnected: true,
			ledgerDevice: { id: "nanoSP" },
			listenDevice: vi.fn(),
		} as any);

		vi.spyOn(unconfirmedHook, "useUnconfirmedTransactions").mockReturnValue({
			addUnconfirmedTransactionFromSigned: vi.fn(),
		} as any);

		vi.spyOn(wallet, "isLedger").mockReturnValue(true);
		vi.spyOn(profile.ledger(), "isNanoX").mockResolvedValue(true);
		vi.spyOn(profile.ledger(), "getPublicKey").mockResolvedValue(
			"0335a27397927bfa1704116814474d39c2b933aabb990e7226389f022886e48deb",
		);
		const address = wallet.address();
		const balance = wallet.balance();
		const derivationPath = "m/44'/1'/1'/0/0";
		vi.spyOn(wallet.data(), "get").mockImplementation((key) => {
			if (key == Contracts.WalletData.Address) {
				return address;
			}
			if (key == Contracts.WalletData.Balance) {
				return balance;
			}
			if (key == Contracts.WalletData.DerivationPath) {
				return derivationPath;
			}
		});
		vi.spyOn(wallet, "balance").mockReturnValue(1_000_000_000_000_000_000);

		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await selectFirstSenderAddress();

		await selectRecipient();
		await expect(screen.findByTestId("Modal__inner")).resolves.toBeInTheDocument();
		await selectFirstRecipient();
		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress));

		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled(), { interval: 5 });
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		const signMock = vi
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.hash));
		const broadcastMock = vi
			.spyOn(wallet.transaction(), "broadcast")
			.mockResolvedValue({ accepted: [transactionFixture.data.hash], errors: {}, rejected: [] });
		const transactionMock = createTransactionMock(wallet);

		await userEvent.click(continueButton());

		await waitFor(() => expect(connectMock).toHaveBeenCalled());
		await waitFor(() => expect(signMock).toHaveBeenCalled());
		await waitFor(() => expect(broadcastMock).toHaveBeenCalled());
		await waitFor(() => expect(screen.getByTestId("SendTransfer__close-button")).toBeVisible());

		transportSpy.mockRestore();
		ledgerCtxSpy.mockRestore();
		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
	});

	it("should auto-select sole wallet when none set", async () => {
		const useActiveWalletSpy = vi.spyOn(appHooks, "useActiveWalletWhenNeeded").mockReturnValue(undefined as any);
		const countSpy = vi.spyOn(profile.wallets(), "count").mockReturnValue(1 as any);
		const valuesSpy = vi.spyOn(profile.wallets(), "values").mockReturnValue([wallet] as any);

		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();
		await waitFor(() =>
			expect(within(screen.getByTestId("sender-address")).getByTestId("SelectDropdown__input")).toHaveValue(
				firstWalletAddress,
			),
		);

		useActiveWalletSpy.mockRestore();
		countSpy.mockRestore();
		valuesSpy.mockRestore();
	});

	it("should open unconfirmed transactions modal and close it", async () => {
		const useTransactionSpy = vi.spyOn(hooks, "useTransaction").mockReturnValue({
			fetchWalletUnconfirmedTransactions: vi.fn().mockResolvedValue([signedTransactionMock]),
		} as any);

		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await selectFirstSenderAddress();
		await selectRecipient();
		await expect(screen.findByTestId("Modal__inner")).resolves.toBeInTheDocument();
		await selectFirstRecipient();
		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress));

		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled(), { interval: 5 });
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		await userEvent.click(continueButton());
		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		await userEvent.click(sendButton());

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();
		await userEvent.click(screen.getByTestId("ConfirmSendTransaction__cancel"));
		await waitFor(() => expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument());

		useTransactionSpy.mockRestore();
	});

	it("should show ErrorStep on sign error and allow going back", async () => {
		const onOpenChange = vi.fn();
		render(<SendTransferSidePanel open={true} onOpenChange={onOpenChange} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await selectFirstSenderAddress();
		await selectRecipient();
		await expect(screen.findByTestId("Modal__inner")).resolves.toBeInTheDocument();
		await selectFirstRecipient();
		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress));

		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled(), { interval: 5 });
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		await userEvent.click(continueButton());
		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		const signMock = vi.spyOn(wallet.transaction(), "signTransfer").mockImplementation(() => {
			throw new Error("broadcast error");
		});

		await userEvent.click(sendButton());
		await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("ErrorStep__back-button"));
		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		signMock.mockRestore();
	});

	it("should show ErrorStep on sign error and allow closing side panel", async () => {
		const onOpenChange = vi.fn();
		render(<SendTransferSidePanel open={true} onOpenChange={onOpenChange} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await selectFirstSenderAddress();
		await selectRecipient();
		await expect(screen.findByTestId("Modal__inner")).resolves.toBeInTheDocument();
		await selectFirstRecipient();
		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress));

		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled(), { interval: 5 });
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		await userEvent.click(continueButton());
		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		const signMock = vi.spyOn(wallet.transaction(), "signTransfer").mockImplementation(() => {
			throw new Error("broadcast error");
		});

		await userEvent.click(sendButton());
		await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("ErrorStep__close-button"));
		await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));

		signMock.mockRestore();
	});

	it("should show ErrorStep when device not available on AuthenticationStep", async () => {
		vi.spyOn(LedgerTransportFactory, "isLedgerTransportSupported").mockReturnValue(false);
		vi.spyOn(wallet, "isLedger").mockReturnValue(true);

		render(<SendTransferSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();

		await selectFirstSenderAddress();
		await selectRecipient();
		await expect(screen.findByTestId("Modal__inner")).resolves.toBeInTheDocument();
		await selectFirstRecipient();
		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress));

		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled(), { interval: 5 });
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();

		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();
	});

	it("should close side panel from summary step", async () => {
		server.use(
			requestMock(
				`https://dwallets-evm.mainsailhq.com/api/transactions/8e4a8c3eaf2f9543a5bd61bb85ddd2205d5091597a77446c8b99692e0854b978`,
				transactionFixture,
			),
			requestMock(`https://dwallets-evm.mainsailhq.com/api/blocks*`, { data: {} }),
		);

		const useTransactionSpy = vi.spyOn(hooks, "useTransaction").mockReturnValue({
			fetchWalletUnconfirmedTransactions: vi.fn().mockResolvedValue([signedTransactionMock]),
		} as any);
		vi.spyOn(unconfirmedHook, "useUnconfirmedTransactions").mockReturnValue({
			addUnconfirmedTransactionFromSigned: vi.fn(),
		} as any);

		const onOpenChange = vi.fn();
		render(<SendTransferSidePanel open={true} onOpenChange={onOpenChange} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId(formStepID)).resolves.toBeVisible();
		await selectFirstSenderAddress();
		await selectRecipient();
		await expect(screen.findByTestId("Modal__inner")).resolves.toBeInTheDocument();
		await selectFirstRecipient();
		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__input")[0]).toHaveValue(firstWalletAddress));
		await userEvent.clear(screen.getByTestId("AddRecipient__amount"));
		await userEvent.type(screen.getByTestId("AddRecipient__amount"), "1");
		await waitFor(() => expect(screen.getByTestId("AddRecipient__amount")).toHaveValue("1"));
		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());
		await expect(screen.findByTestId(reviewStepID)).resolves.toBeVisible();
		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());
		await userEvent.click(continueButton());
		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();
		await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));
		const signMock = vi
			.spyOn(wallet.transaction(), "signTransfer")
			.mockReturnValue(Promise.resolve(transactionFixture.data.hash));
		const broadcastMock = vi
			.spyOn(wallet.transaction(), "broadcast")
			.mockResolvedValue({ accepted: [transactionFixture.data.hash], errors: {}, rejected: [] });
		const transactionMock = createTransactionMock(wallet);
		await userEvent.click(sendButton());
		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();
		await userEvent.click(screen.getByTestId("ConfirmSendTransaction__confirm"));
		await waitFor(() => expect(screen.getByTestId("SendTransfer__close-button")).toBeVisible());
		await userEvent.click(screen.getByTestId("SendTransfer__close-button"));
		await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
		useTransactionSpy.mockRestore();
	});
});
