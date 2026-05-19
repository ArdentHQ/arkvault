import cn from "classnames";
import React, { ReactElement, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export const DetailLabelText = ({ children, className }: { children: ReactNode; className?: string }) => (
	<div
		data-testid="DetailLabelText"
		className={twMerge(
			"no-ligatures min-w-24 font-semibold text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-secondary-500",
			"text-sm leading-[17px] sm:text-base sm:leading-5",
			className,
		)}
	>
		{children}
	</div>
);

export const DetailLabel = ({ children, className }: { children: ReactNode; className?: string }) => (
	<div
		data-testid="DetailLabel"
		className={twMerge(
			"border-l-2 border-x-theme-primary-400 bg-theme-secondary-100 px-3 py-2 dim:border-x-theme-dim-navy-400 dim:bg-theme-dim-950 dark:bg-black sm:border-none sm:bg-transparent sm:p-0 dim:sm:bg-transparent dark:sm:bg-transparent",
			className,
		)}
	>
		<DetailLabelText>{children}</DetailLabelText>
	</div>
);

export const DetailWrapper = ({
	children,
	label,
	className,
	footer,
}: {
	children: ReactNode;
	label?: string | React.ReactNode;
	className?: string;
	footer?: React.ReactNode;
}): ReactElement => (
	<div data-testid="DetailWrapper">
		{label && <DetailLabel>{label}</DetailLabel>}
		<div
			className={twMerge(
				"overflow-hidden rounded-xl border-theme-secondary-300 dim:border-theme-dim-700 dark:border-theme-dark-700 sm:border",
				cn({
					"mt-0 sm:mt-2": !!label,
				}),
				className,
			)}
		>
			<div className="sm:in-[.condensed]:py-4 w-full break-words p-3 sm:px-6 sm:py-5">{children}</div>

			{footer && (
				<div className="flex w-full flex-col bg-theme-secondary-300 px-6 py-3 dark:bg-theme-secondary-800">
					{footer}
				</div>
			)}
		</div>
	</div>
);

export const DetailTitle = ({ children, className }: { children: ReactNode; className?: string }): ReactNode => (
	<div
		className={twMerge(
			"no-ligatures w-20 shrink-0 text-sm font-semibold leading-[17px] text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-secondary-500 sm:text-base sm:leading-5",
			className,
		)}
		data-testid="DetailTitle"
	>
		{children}
	</div>
);

export const DetailsCondensed = ({ children }: { children: ReactNode }): ReactNode => (
	<div className="condensed">{children}</div>
);

export const DetailPadded = ({ children, className }: { children: React.ReactNode; className?: string }) => (
	<div className={cn("group flex", className)}>
		<div className="hidden sm:ml-3 sm:flex">
			<div className="min-w-9 flex-row pr-3">
				<div className="-mt-2 h-6 w-full rounded-bl-xl border-b-2 border-l-2 border-theme-secondary-300 dim:border-theme-dim-700 dark:border-theme-secondary-800" />
				<div className="h-[105%] w-full border-l-2 border-theme-secondary-300 group-last:hidden dim:border-theme-dim-700 dark:border-theme-secondary-800" />
			</div>
		</div>
		<div className="w-full min-w-0 sm:flex-row">{children}</div>
	</div>
);
