import { renderHook } from "@testing-library/react";

import { BatchTransferTabStep } from "@/domains/transaction/components/SendTransferSidePanel/BatchTransfer/BatchTransferTabs.contracts";
import { translations } from "@/domains/transaction/i18n";
import { WithProviders } from "@/utils/testing-library";
import { useBatchTransferStepConfig } from "./use-batch-transfer-header-config";

const renderConfig = (activeTab: BatchTransferTabStep, isConfirmed = false) =>
	renderHook(() => useBatchTransferStepConfig({ activeTab, isConfirmed }), { wrapper: WithProviders }).result.current;

describe("useBatchTransferStepConfig", () => {
	it("should return the review step title, subtitle and icon", () => {
		const { getTitle, getSubtitle, getTitleIcon } = renderConfig(BatchTransferTabStep.ReviewStep);

		expect(getTitle()).toBe(translations.REVIEW_STEP.TITLE);
		expect(getSubtitle()).toBe(translations.REVIEW_STEP.DESCRIPTION);

		const icon = getTitleIcon();
		expect(icon.props.lightIcon).toBe("DocumentView");
	});

	it("should return the approve contract step title and subtitle", () => {
		const { getTitle, getSubtitle } = renderConfig(BatchTransferTabStep.ApproveStep);

		expect(getTitle()).toBe(translations.BATCH_TRANSFER.APPROVE_CONTRACT_STEP.TITLE);
		expect(getSubtitle()).toBe(translations.BATCH_TRANSFER.APPROVE_CONTRACT_STEP.DESCRIPTION);
	});

	it("should return the pending summary step title, subtitle and icon when not confirmed", () => {
		const { getTitle, getSubtitle, getTitleIcon } = renderConfig(BatchTransferTabStep.SummaryStep, false);

		expect(getTitle()).toBe(translations.BATCH_TRANSFER.SUMMARY_PENDING_STEP.TITLE);
		expect(getSubtitle()).toBe(translations.BATCH_TRANSFER.SUMMARY_PENDING_STEP.DESCRIPTION);

		const icon = getTitleIcon();
		expect(icon.props.lightIcon).toBe("UnconfirmedTransaction");
	});

	it("should return the confirmed summary step title, subtitle and icon when confirmed", () => {
		const { getTitle, getSubtitle, getTitleIcon } = renderConfig(BatchTransferTabStep.SummaryStep, true);

		expect(getTitle()).toBe(translations.BATCH_TRANSFER.SUMMARY_CONFIRMED_STEP.TITLE);
		expect(getSubtitle()).toBe(translations.BATCH_TRANSFER.SUMMARY_CONFIRMED_STEP.DESCRIPTION);

		const icon = getTitleIcon();
		expect(icon.props.lightIcon).toBe("CheckmarkDoubleCircle");
	});

	it("should return the confirm transfer step title, subtitle and icon by default", () => {
		const { getTitle, getSubtitle, getTitleIcon } = renderConfig(BatchTransferTabStep.ConfirmTransferStep);

		expect(getTitle()).toBe(translations.BATCH_TRANSFER.CONFIRM_TRANSFER_STEP.TITLE);
		expect(getSubtitle()).toBe(translations.BATCH_TRANSFER.CONFIRM_TRANSFER_STEP.DESCRIPTION);

		const icon = getTitleIcon();
		expect(icon.props.lightIcon).toBe("Mnemonic");
	});
});
