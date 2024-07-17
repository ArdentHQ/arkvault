import cn from "classnames";
import React, { ReactElement, ReactNode } from "react";

type LabelMinWidth = "auto" | "sm" | "md";

export const TransactionReviewLabelText = ({
	children,
	minWidth,
}: {
	children: ReactNode;
	minWidth?: LabelMinWidth;
}) => (
	<div
		data-testid="TransactionReviewLabelText"
		className={cn("no-ligatures text-md font-semibold text-theme-secondary-700 dark:text-theme-secondary-500", {
			"min-w-16": minWidth === "sm",
			"min-w-36": minWidth === "md",
		})}
	>
		{children}
	</div>
);

export const TransactionReviewDetailLabel = ({ children }: { children: ReactNode }) => (
	<div
		data-testid="TransactionReviewDetailLabel"
		className={cn(
			"border-l-2 border-x-theme-primary-400 bg-theme-secondary-100 px-3 py-2 dark:bg-theme-secondary-800 sm:border-none sm:bg-transparent sm:p-0 dark:sm:bg-transparent",
		)}
	>
		<TransactionReviewLabelText>{children}</TransactionReviewLabelText>
	</div>
);

export const TransactionReviewDetail = ({ children, label }: { children: ReactNode; label?: string }): ReactElement => (
	<div data-testid="TransactionReviewDetail">
		{label && <TransactionReviewDetailLabel>{label}</TransactionReviewDetailLabel>}
		<div
			className={cn(
				"w-full rounded-lg border-theme-secondary-300 p-3 dark:border-theme-secondary-800 sm:border sm:px-6 sm:py-5",
				{
					"mt-0 sm:mt-2": !!label,
				},
			)}
		>
			{children}
		</div>
	</div>
);
