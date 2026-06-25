import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/app/components/Icon";
import { Spinner } from "@/app/components/Spinner";
import cn from "classnames";

export type ApprovalStatus = "awaiting" | "loading" | "approved";
export type TransferStatus = "awaiting" | "active";

type Status = ApprovalStatus | TransferStatus;

export const TransactionStepLabel = ({ status }: { status: Status }): React.ReactElement => {
	if (status === "loading") {
		return <LabelLoading />;
	}

	if (status === "approved") {
		return <LabelApproved />;
	}

	if (status === "active") {
		return <LabelActive/>;
	}

	return <LabelAwaiting />;
};

const labelBackgroundClasses = ({ status }: { status: Status }) =>
	cn({
		"dim:bg-theme-success-900 bg-theme-success-100 dark:bg-theme-success-900": status === "approved",
		"dim:bg-transparent bg-theme-secondary-200 dark:bg-transparent ": status === "awaiting" || status === "active",
		"dim:bg-transparent bg-theme-warning-50 dark:bg-transparent": status === "loading",
	});

const labelBorderClasses = ({ status }: { status: Status }) =>
	cn({
		"border border-theme-warning-50 dim:border-theme-dim-700 dark:border-theme-dark-700": status === "loading",
		"border dim:border-theme-success-900 border-theme-success-100 dark:border-theme-success-900":
			status === "approved",
		"dim:border-theme-dim-700 border border-transparent dark:border-theme-dark-700": status === "awaiting" || status === "active",
	});

export const LabelApproved = ({ className }: { className?: string }): React.ReactElement => {
	const { t } = useTranslation();

	return (
		<div
			data-testid="LabelCompleted"
			className={cn(
				"flex space-x-2 rounded-sm px-1 py-[3px] text-xs text-theme-success-700 dim:text-theme-success-500 dark:text-theme-success-500",
				labelBackgroundClasses({ status: "approved" }),
				labelBorderClasses({ status: "approved" }),
				{ className },
			)}
		>
			<Icon name="CheckmarkDouble" className="h-4 w-4" />
			<span className="whitespace-nowrap font-semibold">{t("COMMON.APPROVED")}</span>
		</div>
	);
};

export const LabelActive = ({ className }: { className?: string }): React.ReactElement => {
	const { t } = useTranslation();

	return (
		<div
			data-testid="LabelCompleted"
			className={cn(
				"flex space-x-2 rounded-sm px-1 py-[3px] text-xs text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-dark-200",
				labelBackgroundClasses({ status: "active" }),
				labelBorderClasses({ status: "active" }),
				{ className },
			)}
		>
			<span className="whitespace-nowrap font-semibold">{t("COMMON.ACTIVE")}</span>
		</div>
	);
};

export const LabelLoading = ({ className }: { className?: string }): React.ReactElement => {
	const { t } = useTranslation();

	return (
		<div
			data-testid="LabelLoading"
			className={cn(
				"flex space-x-2 rounded-sm px-1 py-[3px] text-xs text-theme-warning-900 dim:text-theme-dim-200 dark:text-theme-dark-200",
				className,
				labelBackgroundClasses({ status: "loading" }),
				labelBorderClasses({ status: "loading" }),
			)}
		>
			<Spinner color="warning-alt" size="xs" width={2} />
			<span className="whitespace-nowrap font-semibold">{t("COMMON.LOADING")}</span>
		</div>
	);
};

export const LabelAwaiting = ({ className }: { className?: string }): React.ReactElement => {
	const { t } = useTranslation();

	return (
		<div
			data-testid="LabelAwaiting"
			className={cn(
				"flex space-x-2 rounded-sm px-1 py-[3px] text-xs text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-dark-200",
				labelBackgroundClasses({ status: "awaiting" }),
				labelBorderClasses({ status: "awaiting" }),
				className,
			)}
		>
			<span className="whitespace-nowrap font-semibold">{t("COMMON.AWAITING")}</span>
		</div>
	);
};
