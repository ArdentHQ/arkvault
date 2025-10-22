import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/app/components/Icon";
import { Spinner } from "@/app/components/Spinner";
import cn from "classnames";

export const TransactionConfirmationStatusLabel = ({
	isCompleted,
	isPending,
	className,
}: {
	className?: string,
	isPending?: boolean;
	isCompleted?: boolean;
}): React.ReactElement => {
	if (isCompleted) {
		return <LabelCompleted className={className} />
	}

	if (isPending) {
		return <LabelPending />
	}

	return <LabelAwaiting />
};

export const labelBackgroundClasses = ({ isCompleted, isPending }: { isCompleted?: boolean, isPending?: boolean }) => cn({
	"dim:bg-theme-success-900 bg-theme-success-100 dark:bg-theme-success-900": isCompleted,
	"dim:bg-transparent bg-theme-secondary-200 dark:bg-transparent ": !isCompleted && !isPending,
	"dim:bg-transparent bg-theme-warning-50 dark:bg-transparent": isPending
})

export const labelBorderClasses = ({ isCompleted, isPending }: { isCompleted?: boolean, isPending?: boolean }) => cn({
	"border border-theme-warning-50 dim:border-theme-dim-700 dark:border-theme-dark-700": isPending,
	"border dim:border-theme-success-900 border-theme-success-100 dark:border-theme-success-900": isCompleted,
	"dim:border-theme-dim-700 border border-transparent dark:border-theme-dark-700": !isCompleted && !isPending
})


export const LabelCompleted = ({ className }: { className?: string }): React.ReactElement => {
	const { t } = useTranslation()

	return (
		<div className={cn(
			"dim:text-theme-success-500 text-theme-success-700 py-[3px] px-1 dark:text-theme-success-500 flex space-x-2 text-xs rounded-sm",
			labelBackgroundClasses({ isCompleted: true }),
			labelBorderClasses({ isCompleted: true }),
			{ className }
		)}>
			<Icon name="CheckmarkDouble" className="w-4 h-4" />
			<span className="whitespace-nowrap font-semibold">
				{t("COMMON.COMPLETED")}
			</span>
		</div >
	)
};

export const LabelPending = ({ className }: { className?: string }): React.ReactElement => {
	const { t } = useTranslation()

	return (
		<div className={cn(
			"text-theme-warning-900 py-[3px] px-1 dark:text-theme-dark-200 flex space-x-2 dim:text-theme-dim-200 text-xs rounded-sm ",
			className,
			labelBackgroundClasses({ isPending: true }),
			labelBorderClasses({ isPending: true }),
		)}>
			<Spinner color="warning-alt" size="xs" width={2} />
			<span className="whitespace-nowrap font-semibold">
				{t("COMMON.PENDING")}
			</span>
		</div>
	)
};

export const LabelAwaiting = ({ className }: { className?: string }): React.ReactElement => {
	const { t } = useTranslation()

	return (
		<div className={cn(
			"dim:text-theme-dim-200 text-theme-secondary-700 py-[3px] px-1 dark:text-theme-dark-200 flex space-x-2 text-xs rounded-sm",
			labelBackgroundClasses({ isCompleted: false, isPending: false }),
			labelBorderClasses({ isPending: true }),
			className
		)}>
			<span className="whitespace-nowrap font-semibold">
				{t("COMMON.AWAITING")}
			</span>
		</div>
	)
};
