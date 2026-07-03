import { renderHook } from "@testing-library/react";

import { Contracts } from "@/app/lib/profiles";
import { SendTransferStep } from "@/domains/transaction/components/SendTransferSidePanel/SendTransfer.contracts";
import { translations } from "@/domains/transaction/i18n";
import { env, getDefaultProfileId, WithProviders } from "@/utils/testing-library";
import { useSendTransferStepConfig } from "./use-send-transfer-header-config";

const renderConfig = (activeTab: SendTransferStep, wallet?: Contracts.IReadWriteWallet, isConfirmed = false) =>
	renderHook(() => useSendTransferStepConfig({ activeTab, isConfirmed, wallet }), { wrapper: WithProviders }).result
		.current;

describe("useSendTransferStepConfig", () => {
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(() => {
		const profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should return the form step title, subtitle and icon", () => {
		const { getTitle, getSubtitle, getTitleIcon } = renderConfig(SendTransferStep.FormStep, wallet);

		expect(getTitle()).toBe(translations.PAGE_TRANSACTION_SEND.FORM_STEP.TITLE);
		expect(getSubtitle()).toBe(translations.PAGE_TRANSACTION_SEND.FORM_STEP.DESCRIPTION);

		const icon = getTitleIcon();
		expect(icon.props.lightIcon).toBe("SendTransactionLight");
	});

	it("should fall back to the form step title and icon but return no subtitle for the network step", () => {
		const { getTitle, getSubtitle, getTitleIcon } = renderConfig(SendTransferStep.NetworkStep, wallet);

		expect(getTitle()).toBe(translations.PAGE_TRANSACTION_SEND.FORM_STEP.TITLE);
		expect(getSubtitle()).toBeUndefined();

		const icon = getTitleIcon();
		expect(icon.props.lightIcon).toBe("SendTransactionLight");
	});

	it("should return the review step title, subtitle and icon", () => {
		const { getTitle, getSubtitle, getTitleIcon } = renderConfig(SendTransferStep.ReviewStep, wallet);

		expect(getTitle()).toBe(translations.REVIEW_STEP.TITLE);
		expect(getSubtitle()).toBe(translations.REVIEW_STEP.DESCRIPTION);

		const icon = getTitleIcon();
		expect(icon.props.lightIcon).toBe("DocumentView");
	});

	it("should return the error step title, undefined subtitle and icon", () => {
		const { getTitle, getSubtitle, getTitleIcon } = renderConfig(SendTransferStep.ErrorStep, wallet);

		expect(getTitle()).toBe(translations.ERROR.TITLE);
		expect(getSubtitle()).toBeUndefined();

		const icon = getTitleIcon();
		expect(icon.props.name).toBe("ErrorHeaderIcon");
	});

	it("should return the pending summary step title, undefined subtitle and icon when not confirmed", () => {
		const { getTitle, getSubtitle, getTitleIcon } = renderConfig(SendTransferStep.SummaryStep, wallet, false);

		expect(getTitle()).toBe(translations.PENDING.TITLE);
		expect(getSubtitle()).toBeUndefined();

		const icon = getTitleIcon();
		expect(icon.props.lightIcon).toBe("UnconfirmedTransaction");
	});

	it("should return the confirmed summary step title and icon when confirmed", () => {
		const { getTitle, getTitleIcon } = renderConfig(SendTransferStep.SummaryStep, wallet, true);

		expect(getTitle()).toBe(translations.SUCCESS.CREATED);

		const icon = getTitleIcon();
		expect(icon.props.lightIcon).toBe("CheckmarkDoubleCircle");
	});

	it("should return the select-wallet subtitle and mnemonic icon when there is no wallet", () => {
		const { getTitle, getSubtitle, getTitleIcon } = renderConfig(SendTransferStep.AuthenticationStep, undefined);

		expect(getTitle()).toBe(translations.AUTHENTICATION_STEP.TITLE);
		expect(getSubtitle()).toBe(translations.FORM_STEP.DESCRIPTION_SELECT_WALLET);

		const icon = getTitleIcon();
		expect(icon.props.lightIcon).toBe("Mnemonic");
	});

	it("should return the mnemonic subtitle and icon for a mnemonic wallet", () => {
		vi.spyOn(wallet, "isLedger").mockReturnValue(false);
		vi.spyOn(wallet, "actsWithSecret").mockReturnValue(false);
		vi.spyOn(wallet, "signingKey").mockReturnValue({ exists: () => false } as any);

		const { getSubtitle, getTitleIcon } = renderConfig(SendTransferStep.AuthenticationStep, wallet);

		expect(getSubtitle()).toBe(translations.AUTHENTICATION_STEP.DESCRIPTION_MNEMONIC);

		const icon = getTitleIcon();
		expect(icon.props.lightIcon).toBe("Mnemonic");
	});

	it("should return the encryption password subtitle for a wallet with a signing key", () => {
		vi.spyOn(wallet, "isLedger").mockReturnValue(false);
		vi.spyOn(wallet, "actsWithSecret").mockReturnValue(false);
		vi.spyOn(wallet, "signingKey").mockReturnValue({ exists: () => true } as any);

		const { getSubtitle } = renderConfig(SendTransferStep.AuthenticationStep, wallet);

		expect(getSubtitle()).toBe(translations.AUTHENTICATION_STEP.DESCRIPTION_ENCRYPTION_PASSWORD);
	});

	it("should return the secret subtitle for a wallet that acts with a secret", () => {
		vi.spyOn(wallet, "isLedger").mockReturnValue(false);
		vi.spyOn(wallet, "actsWithSecret").mockReturnValue(true);

		const { getSubtitle } = renderConfig(SendTransferStep.AuthenticationStep, wallet);

		expect(getSubtitle()).toBe(translations.AUTHENTICATION_STEP.DESCRIPTION_SECRET);
	});

	it("should return the ledger subtitle and icon for a ledger wallet", () => {
		vi.spyOn(wallet, "isLedger").mockReturnValue(true);

		const { getSubtitle, getTitleIcon } = renderConfig(SendTransferStep.AuthenticationStep, wallet);

		expect(getSubtitle()).toBe(translations.AUTHENTICATION_STEP.DESCRIPTION_LEDGER);

		const icon = getTitleIcon();
		expect(icon.props.lightIcon).toBe("LedgerLight");
	});
});
