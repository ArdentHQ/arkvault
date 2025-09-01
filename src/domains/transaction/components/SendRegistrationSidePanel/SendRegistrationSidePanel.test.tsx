import { Contracts, DTO } from "@/app/lib/profiles";
import {
	env,
	getDefaultProfileId,
	getDefaultWalletMnemonic,
	render,
	screen,
	syncFees,
	waitFor,
	getMainsailProfileId,
	within,
} from "@/utils/testing-library";
import React from "react";
import { requestMock, server } from "@/tests/mocks/server";

import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import { SendRegistrationSidePanel } from "./SendRegistrationSidePanel";
import transactionFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/transfer.json";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import userEvent from "@testing-library/user-event";
import * as LedgerTransportFactory from "@/app/contexts/Ledger/transport";
import * as AppContexts from "@/app/contexts";
import * as hooks from "@/domains/transaction/hooks";
import * as pendingHook from "@/domains/transaction/hooks/use-pending-transactions";
import * as appHooks from "@/app/hooks";

const passphrase = getDefaultWalletMnemonic();
const fixtureProfileId = getDefaultProfileId();

const signedTransactionMock = {
	blockHash: () => {},
	confirmations: () => BigNumber.ZERO,
	convertedAmount: () => 0,
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
	hash: () => transactionFixture.data.hash,
	isConfirmed: () => false,
	isMultiPayment: () => false,
	isMultiSignatureRegistration: () => false,
	isReturn: () => false,
	isSecondSignature: () => false,
	isSent: () => true,
	isSuccess: () => true,
	isTransfer: () => false,
	isUnvote: () => false,
	isUpdateValidator: () => false,
	isUsernameRegistration: () => true,
	isValidatorRegistration: () => false,
	isVote: () => false,
	isVoteCombination: () => false,
	memo: () => transactionFixture.data.memo || undefined,
	nonce: () => BigNumber.make(transactionFixture.data.nonce),
	payments: () => [],
	recipients: () => [],
	sender: () => transactionFixture.data.sender,
	timestamp: () => DateTime.make(transactionFixture.data.timestamp),
	to: () => transactionFixture.data.to,
	total: () => {
		const value = BigNumber.make(transactionFixture.data.value);
		const feeVal = BigNumber.make(transactionFixture.data.gasPrice).times(transactionFixture.data.gas);
		return value.plus(feeVal);
	},
	type: () => "usernameRegistration",
	usesMultiSignature: () => false,
	value: () => 0,
	wallet: () => wallet,
} as DTO.ExtendedSignedTransactionData;

const createTransactionMock = (wallet: Contracts.IReadWriteWallet) =>
	vi.spyOn(wallet.transaction(), "transaction").mockReturnValue(signedTransactionMock);

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

const continueButton = () => screen.getByTestId("SendRegistration__continue-button");
const sendButton = () => screen.getByTestId("SendRegistration__send-button");
const backButton = () => screen.getByTestId("SendRegistration__back-button");

describe("SendRegistrationSidePanel", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();

		await syncFees(profile);

		server.use(
			requestMock(
				`https://dwallets-evm.mainsailhq.com/api/transactions/${transactionFixture.data.hash}`,
				transactionFixture,
			),
		);
	});

	beforeEach(() => {
		vi.spyOn(wallet, "balance").mockReturnValue(1_000_000_000_000_000_000);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should send a validator registration via side panel", async () => {
		render(<SendRegistrationSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId("ValidatorRegistrationForm_form-step")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("SelectDropdown__input"));
		await expect(screen.findByTestId("SelectDropdown__option--0")).resolves.toBeVisible();
		await userEvent.click(screen.getByTestId("SelectDropdown__option--0"));

		await userEvent.clear(screen.getByTestId("Input__validator_public_key"));
		await userEvent.type(screen.getByTestId("Input__validator_public_key"), "validator-public-key");
		await waitFor(() =>
			expect(screen.getByTestId("Input__validator_public_key")).toHaveValue("validator-public-key"),
		);

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		await expect(screen.findByTestId("ValidatorRegistrationForm__review-step")).resolves.toBeVisible();

		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		await userEvent.click(continueButton());
		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		const signMock = vi
			.spyOn(wallet.transaction(), "signValidatorRegistration")
			.mockReturnValue(Promise.resolve(transactionFixture.data.hash));
		const broadcastMock = vi
			.spyOn(wallet.transaction(), "broadcast")
			.mockResolvedValue({ accepted: [transactionFixture.data.hash], errors: {}, rejected: [] });
		const transactionMock = createTransactionMock(wallet);

		await waitFor(() => expect(sendButton()).not.toBeDisabled());
		await userEvent.click(sendButton());

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
	});

	it("should send a username registration via side panel", async () => {
		render(<SendRegistrationSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId("ValidatorRegistrationForm_form-step")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("SelectDropdown__input"));
		await expect(screen.findByTestId("SelectDropdown__option--0")).resolves.toBeVisible();
		await userEvent.click(screen.getByTestId("SelectDropdown__option--0"));

		await userEvent.clear(screen.getByTestId("Input__username"));
		await userEvent.type(screen.getByTestId("Input__username"), "testusername");
		await waitFor(() => expect(screen.getByTestId("Input__username")).toHaveValue("testusername"));

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());

		await expect(screen.findByTestId("ValidatorRegistrationForm__review-step")).resolves.toBeVisible();

		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		await userEvent.click(continueButton());
		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		const signMock = vi
			.spyOn(wallet.transaction(), "signUsernameRegistration")
			.mockReturnValue(Promise.resolve(transactionFixture.data.hash));
		const broadcastMock = vi
			.spyOn(wallet.transaction(), "broadcast")
			.mockResolvedValue({ accepted: [transactionFixture.data.hash], errors: {}, rejected: [] });
		const transactionMock = createTransactionMock(wallet);

		await waitFor(() => expect(sendButton()).not.toBeDisabled());
		await userEvent.click(sendButton());

		await expect(screen.findByTestId("TransactionSuccessful")).resolves.toBeVisible();

		signMock.mockRestore();
		broadcastMock.mockRestore();
		transactionMock.mockRestore();
	});

	it("should advance to ReviewStep on Enter when form valid and focus is not a button", async () => {
		render(<SendRegistrationSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId("ValidatorRegistrationForm_form-step")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("SelectDropdown__input"));
		await expect(screen.findByTestId("SelectDropdown__option--0")).resolves.toBeVisible();
		await userEvent.click(screen.getByTestId("SelectDropdown__option--0"));

		await userEvent.clear(screen.getByTestId("Input__validator_public_key"));
		await userEvent.type(screen.getByTestId("Input__validator_public_key"), "validator-public-key");
		await waitFor(() =>
			expect(screen.getByTestId("Input__validator_public_key")).toHaveValue("validator-public-key"),
		);

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.keyboard("{Enter}");

		await expect(screen.findByTestId("ValidatorRegistrationForm__review-step")).resolves.toBeVisible();
	});

	it("should do nothing on Enter when focus is on a button", async () => {
		render(<SendRegistrationSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId("ValidatorRegistrationForm_form-step")).resolves.toBeVisible();

		screen.getByTestId("SendRegistration__back-button").focus();
		await userEvent.keyboard("{Enter}");

		expect(screen.getByTestId("ValidatorRegistrationForm_form-step")).toBeInTheDocument();
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

		vi.spyOn(pendingHook, "usePendingTransactions").mockReturnValue({
			addPendingTransaction: vi.fn(),
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

		render(<SendRegistrationSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId("ValidatorRegistrationForm_form-step")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("SelectDropdown__input"));
		await expect(screen.findByTestId("SelectDropdown__option--0")).resolves.toBeVisible();
		await userEvent.click(screen.getByTestId("SelectDropdown__option--0"));

		await userEvent.clear(screen.getByTestId("Input__validator_public_key"));
		await userEvent.type(screen.getByTestId("Input__validator_public_key"), "validator-public-key");
		await waitFor(() =>
			expect(screen.getByTestId("Input__validator_public_key")).toHaveValue("validator-public-key"),
		);

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());
		await expect(screen.findByTestId("ValidatorRegistrationForm__review-step")).resolves.toBeVisible();

		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		const signMock = vi
			.spyOn(wallet.transaction(), "signValidatorRegistration")
			.mockReturnValue(Promise.resolve(transactionFixture.data.hash));
		const broadcastMock = vi
			.spyOn(wallet.transaction(), "broadcast")
			.mockResolvedValue({ accepted: [transactionFixture.data.hash], errors: {}, rejected: [] });
		const transactionMock = createTransactionMock(wallet);

		await userEvent.click(continueButton());

		await waitFor(() => expect(connectMock).toHaveBeenCalled());
		await waitFor(() => expect(signMock).toHaveBeenCalled());
		await waitFor(() => expect(broadcastMock).toHaveBeenCalled());
		await waitFor(() => expect(screen.getByTestId("SendRegistration__close-button")).toBeVisible());

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

		render(<SendRegistrationSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId("ValidatorRegistrationForm_form-step")).resolves.toBeVisible();
		await waitFor(() =>
			expect(within(screen.getByTestId("sender-address")).getByTestId("SelectDropdown__input")).toHaveValue(
				wallet.address(),
			),
		);

		useActiveWalletSpy.mockRestore();
		countSpy.mockRestore();
		valuesSpy.mockRestore();
	});

	it("should show ErrorStep on sign error and allow going back", async () => {
		const onOpenChange = vi.fn();
		render(<SendRegistrationSidePanel open={true} onOpenChange={onOpenChange} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId("ValidatorRegistrationForm_form-step")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("SelectDropdown__input"));
		await expect(screen.findByTestId("SelectDropdown__option--0")).resolves.toBeVisible();
		await userEvent.click(screen.getByTestId("SelectDropdown__option--0"));

		await userEvent.clear(screen.getByTestId("Input__validator_public_key"));
		await userEvent.type(screen.getByTestId("Input__validator_public_key"), "validator-public-key");
		await waitFor(() =>
			expect(screen.getByTestId("Input__validator_public_key")).toHaveValue("validator-public-key"),
		);

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());
		await expect(screen.findByTestId("ValidatorRegistrationForm__review-step")).resolves.toBeVisible();

		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		await userEvent.click(continueButton());
		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		const signMock = vi.spyOn(wallet.transaction(), "signValidatorRegistration").mockImplementation(() => {
			throw new Error("broadcast error");
		});

		await userEvent.click(sendButton());
		await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("ErrorStep__back-button"));
		await expect(screen.findByTestId("ValidatorRegistrationForm_form-step")).resolves.toBeVisible();

		signMock.mockRestore();
	});

	it("should show ErrorStep on sign error and allow closing side panel", async () => {
		const onOpenChange = vi.fn();
		render(<SendRegistrationSidePanel open={true} onOpenChange={onOpenChange} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId("ValidatorRegistrationForm_form-step")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("SelectDropdown__input"));
		await expect(screen.findByTestId("SelectDropdown__option--0")).resolves.toBeVisible();
		await userEvent.click(screen.getByTestId("SelectDropdown__option--0"));

		await userEvent.clear(screen.getByTestId("Input__validator_public_key"));
		await userEvent.type(screen.getByTestId("Input__validator_public_key"), "validator-public-key");
		await waitFor(() =>
			expect(screen.getByTestId("Input__validator_public_key")).toHaveValue("validator-public-key"),
		);

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());
		await expect(screen.findByTestId("ValidatorRegistrationForm__review-step")).resolves.toBeVisible();

		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		await userEvent.click(continueButton());
		await expect(screen.findByTestId("AuthenticationStep")).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId("AuthenticationStep__mnemonic"));
		await userEvent.type(screen.getByTestId("AuthenticationStep__mnemonic"), passphrase);
		await waitFor(() => expect(screen.getByTestId("AuthenticationStep__mnemonic")).toHaveValue(passphrase));

		const signMock = vi.spyOn(wallet.transaction(), "signValidatorRegistration").mockImplementation(() => {
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

		render(<SendRegistrationSidePanel open={true} onOpenChange={vi.fn()} />, {
			route: `/profiles/${fixtureProfileId}/dashboard`,
		});

		await expect(screen.findByTestId("ValidatorRegistrationForm_form-step")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("SelectDropdown__input"));
		await expect(screen.findByTestId("SelectDropdown__option--0")).resolves.toBeVisible();
		await userEvent.click(screen.getByTestId("SelectDropdown__option--0"));

		await userEvent.clear(screen.getByTestId("Input__validator_public_key"));
		await userEvent.type(screen.getByTestId("Input__validator_public_key"), "validator-public-key");
		await waitFor(() =>
			expect(screen.getByTestId("Input__validator_public_key")).toHaveValue("validator-public-key"),
		);

		await waitFor(() => expect(continueButton()).not.toBeDisabled());
		await userEvent.click(continueButton());
		await expect(screen.findByTestId("ValidatorRegistrationForm__review-step")).resolves.toBeVisible();

		await userEvent.click(within(screen.getByTestId("InputFee")).getByText(transactionTranslations.FEES.SLOW));
		await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());

		await userEvent.click(continueButton());

		await expect(screen.findByTestId("ErrorStep")).resolves.toBeVisible();
	});
});
