import cn from "classnames";
import React, { ReactElement, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { Divider } from "@/app/components/Divider";

export const DetailLabelText = ({ children, className }: { children: ReactNode; className?: string }) => (
	<div
		data-testid="DetailLabelText"
		className={twMerge(
			"no-ligatures text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-200 min-w-24 font-semibold",
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
			"border-x-theme-primary-400 dim:border-x-theme-dim-navy-400 bg-theme-secondary-100 dim:bg-theme-dim-950 dim:sm:bg-transparent border-l-2 px-3 py-2 sm:border-none sm:bg-transparent sm:p-0 dark:bg-black dark:sm:bg-transparent",
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
				"border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 overflow-hidden rounded-xl sm:border",
				className,
				cn({
					"mt-0 sm:mt-2": !!label,
				}),
			)}
		>
			<div className="w-full p-3 break-words sm:px-6 sm:py-5 sm:in-[.condensed]:py-4">{children}</div>

			{footer && (
				<div className="bg-theme-secondary-300 dark:bg-theme-secondary-800 flex w-full flex-col px-6 py-3">
					{footer}
				</div>
			)}
		</div>
	</div>
);

export const DetailTitle = ({ children, className }: { children: ReactNode; className?: string }): ReactNode => (
	<div
		className={twMerge(
			"no-ligatures text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-200 w-20 shrink-0 text-sm leading-[17px] font-semibold sm:text-base sm:leading-5",
			className,
		)}
		data-testid="DetailTitle"
	>
		{children}
	</div>
);

/**
 * Adds the `.condensed` class to the parent component, causing all
 * `DetailDivider` children to render in a condensed state (without dashed borders and with reduced spacing).
 *
 * @see DetailDivider
 */
export const DetailsCondensed = ({ children }: { children: ReactNode }): ReactNode => (
	<div className="condensed">{children}</div>
);

export const DetailDivider = (): ReactNode => (
	<div className="hidden h-8 w-full items-center in-[.condensed]:h-3 in-[.condensed]:leading-3 sm:flex">
		<div className="h-full w-full in-[.condensed]:hidden">
			<Divider dashed />
		</div>
	</div>
);

export const DetailPadded = ({ children, className }: { children: React.ReactNode; className?: string }) => (
	<div className={cn("group flex", className)}>
		<div className="hidden sm:ml-3 sm:flex">
			<div className="min-w-9 flex-row pr-3">
				<div className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-theme-dim-700 -mt-2 h-6 w-full rounded-bl-xl border-b-2 border-l-2" />
				<div className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-theme-dim-700 h-[105%] w-full border-l-2 group-last:hidden" />
			</div>
		</div>
		<div className="w-full min-w-0 sm:flex-row">{children}</div>
	</div>
);
