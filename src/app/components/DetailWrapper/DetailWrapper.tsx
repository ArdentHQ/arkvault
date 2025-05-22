import cn from "classnames";
import React, { ReactElement, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { Divider } from "@/app/components/Divider";

export const DetailLabelText = ({
	children,
	className,
	isHeader = false,
}: {
	children: ReactNode;
	className?: string;
	isHeader?: boolean;
}) => (
	<div
		data-testid="DetailLabelText"
		className={twMerge(
			"no-ligatures text-theme-secondary-700 dark:text-theme-secondary-500 min-w-24 font-semibold",
			isHeader ? "text-md leading-5" : "text-sm leading-[17px] sm:text-base sm:leading-5",
			className,
		)}
	>
		{children}
	</div>
);

export const DetailLabel = ({ children }: { children: ReactNode }) => (
	<div
		data-testid="DetailLabel"
		className="py-2 px-3 border-l-2 sm:p-0 sm:bg-transparent sm:border-none dark:bg-black border-x-theme-primary-400 bg-theme-secondary-100 dark:sm:bg-transparent"
	>
		<DetailLabelText isHeader>{children}</DetailLabelText>
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
			className={cn(
				"border-theme-secondary-300 dark:border-theme-dark-700 overflow-hidden rounded-xl sm:border",
				className,
				{
					"mt-0 sm:mt-2": !!label,
				},
			)}
		>
			<div className="p-3 w-full break-words sm:py-5 sm:px-6 sm:in-[.condensed]:py-4">{children}</div>

			{footer && (
				<div className="flex flex-col py-3 px-6 w-full bg-theme-secondary-300 dark:bg-theme-secondary-800">
					{footer}
				</div>
			)}
		</div>
	</div>
);

export const DetailTitle = ({ children, className }: { children: ReactNode; className?: string }): ReactNode => (
	<div
		className={twMerge(
			"no-ligatures text-theme-secondary-700 dark:text-theme-secondary-500 w-20 shrink-0 text-sm leading-[17px] font-semibold sm:text-base sm:leading-5",
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
	<div className="hidden items-center w-full h-8 sm:flex in-[.condensed]:h-3 in-[.condensed]:leading-3">
		<div className="w-full h-full in-[.condensed]:hidden">
			<Divider dashed />
		</div>
	</div>
);

export const DetailPadded = ({ children }: { children: React.ReactNode }) => (
	<div className="flex group">
		<div className="hidden sm:flex sm:ml-3">
			<div className="flex-row pr-3 min-w-9">
				<div className="-mt-2 w-full h-6 rounded-bl-xl border-b-2 border-l-2 border-theme-secondary-300 dark:border-theme-secondary-800" />
				<div className="border-theme-secondary-300 dark:border-theme-secondary-800 h-[105%] w-full border-l-2 group-last:hidden" />
			</div>
		</div>
		<div className="w-full min-w-0 sm:flex-row">{children}</div>
	</div>
);
