import cn from "classnames";
import React, { ReactElement, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { Divider } from "@/app/components/Divider";

export const DetailLabelText = ({ children, className }: { children: ReactNode; className?: string }) => (
	<div
		data-testid="DetailLabelText"
		className={twMerge(
			"no-ligatures text-md min-w-24 font-semibold text-theme-secondary-700 dark:text-theme-secondary-500",
			className,
		)}
	>
		{children}
	</div>
);

export const DetailLabel = ({ children }: { children: ReactNode }) => (
	<div
		data-testid="DetailLabel"
		className={cn(
			"border-l-2 border-x-theme-primary-400 bg-theme-secondary-100 px-3 py-2 dark:bg-theme-secondary-800 sm:border-none sm:bg-transparent sm:p-0 dark:sm:bg-transparent",
		)}
	>
		<DetailLabelText>{children}</DetailLabelText>
	</div>
);

export const DetailWrapper = ({
	children,
	label,
}: {
	children: ReactNode;
	label?: string | React.ReactNode;
}): ReactElement => (
	<div data-testid="DetailWrapper">
		{label && <DetailLabel>{label}</DetailLabel>}
		<div
			className={cn(
				"w-full break-words rounded-lg border-theme-secondary-300 p-3 dark:border-theme-secondary-800 sm:border sm:px-6 sm:py-5 [.condensed_&]:sm:py-4",
				{
					"mt-0 sm:mt-2": !!label,
				},
			)}
		>
			{children}
		</div>
	</div>
);

export const DetailTitle = ({ children, className }: { children: ReactNode; className?: string }): ReactNode => (
	<div
		className={twMerge(
			"no-ligatures w-20 flex-shrink-0 text-sm font-semibold leading-[17px] text-theme-secondary-700 dark:text-theme-secondary-500 sm:text-base sm:leading-5",
			className,
		)}
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
	<div className="hidden h-8 w-full items-center sm:flex [.condensed_&]:h-3">
		<div className="w-full [.condensed_&]:hidden">
			<Divider dashed />
		</div>
	</div>
);

export const DetailPadded = ({ children }: { children: React.ReactNode }) => (
	<div className="group flex">
		<div className="hidden sm:ml-3 sm:flex">
			<div className="min-w-9 flex-row pr-3">
				<div className="-mt-2 h-6 w-full rounded-bl-xl border-b-2 border-l-2 border-theme-secondary-300 dark:border-theme-secondary-800" />
				<div className="h-[105%] w-full border-l-2 border-theme-secondary-300 group-last:hidden dark:border-theme-secondary-800" />
			</div>
		</div>
		<div className="w-full sm:flex-row">{children}</div>
	</div>
);
