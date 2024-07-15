import cn from "classnames";
import React, { ReactElement, ReactNode } from "react";

type LabelMinWidth = "auto" | "sm" | "md"


export const TransactionReviewLabelText = ({ children, minWidth }: { children: ReactNode, minWidth?: LabelMinWidth }) => <div className={
	cn("no-ligatures text-md font-semibold text-theme-secondary-700 dark:text-theme-secondary-500", {
		"min-w-16": minWidth === "sm",
		"min-w-36": minWidth === "md",
	})}>
	{children}
</div>

export const TransactionReviewDetailLabel = ({ children }: { children: ReactNode }) => <div className={
	cn("border-l-2 border-x-theme-primary-400 bg-theme-secondary-100 dark:bg-theme-secondary-800 py-2 px-3 sm:p-0 sm:border-none sm:bg-transparent")}>
	<TransactionReviewLabelText>{children}</TransactionReviewLabelText>
</div>


export const TransactionReviewDetail = ({ children, label, labelMinWidth }: { children: ReactNode, label?: string, labelMinWidth?: LabelMinWidth }): ReactElement => <div
	data-testid="TransactionReviewDetail"
>
	{label && <TransactionReviewDetailLabel>{label}</TransactionReviewDetailLabel>}
	<div className={cn("rounded-lg sm:border border-theme-secondary-300 dark:border-theme-secondary-800 p-3 sm:py-5 sm:px-6 w-full", {
		"sm:mt-2 mt-0": !!label
	})}>
		{children}
	</div>
</div>
