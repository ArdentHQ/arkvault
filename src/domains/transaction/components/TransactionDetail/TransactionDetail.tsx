import cn from "classnames";
import React, { JSX } from "react";
import { getStyles } from "./TransactionDetail.styles";
import { SmAndBelow, MdAndAbove } from "@/app/components/Breakpoint";
import { twMerge } from "tailwind-merge";

export type TransactionDetailProperties = {
	children?: React.ReactNode;
	label?: string | React.ReactNode;
	extra?: React.ReactNode;
	border?: boolean;
	borderPosition?: "top" | "bottom" | "both";
	padding?: boolean;
	paddingPosition?: "top" | "bottom" | "both" | "none";
	className?: string;
	useDesktop?: boolean;
	ref?: React.Ref<HTMLDivElement>;
} & React.HTMLAttributes<any>;

const TransactionDetailStyled = ({
	border,
	borderPosition,
	padding,
	paddingPosition,
	className,
	ref,
	...properties
}) => (
	<div
		{...properties}
		ref={ref}
		className={twMerge(getStyles({ border, borderPosition, padding, paddingPosition }), className)}
	/>
);

TransactionDetailStyled.displayName = "TransactionDetailStyled";

const RowLabel = ({ children }: { children: React.ReactNode }) => (
	<div className="text-md group border-theme-secondary-300 text-theme-secondary-700 md:theme-text dark:border-theme-secondary-800 dark:text-theme-secondary-500 relative m-0 text-left font-semibold select-none first:pl-0 last:pr-0">
		{children}
	</div>
);

const TransactionDetailContainer: React.FC<{
	useDesktop?: boolean;
	desktopContent: JSX.Element;
	mobileContent: JSX.Element;
}> = ({ desktopContent, mobileContent, useDesktop }) => {
	if (useDesktop) {
		return desktopContent;
	}

	return (
		<>
			<SmAndBelow>{mobileContent}</SmAndBelow>
			<MdAndAbove>{desktopContent}</MdAndAbove>
		</>
	);
};

export const TransactionDetail = ({
	border = true,
	borderPosition = "top",
	children,
	className,
	extra,
	label,
	padding = true,
	paddingPosition,
	useDesktop = false,
	ref,
	...properties
}: TransactionDetailProperties) => (
	<TransactionDetailStyled
		data-testid="TransactionDetail"
		border={border}
		borderPosition={borderPosition}
		padding={padding}
		paddingPosition={paddingPosition}
		className={cn("no-ligatures", className)}
		ref={ref}
		{...properties}
	>
		<TransactionDetailContainer
			useDesktop={useDesktop}
			mobileContent={
				<div
					data-testid="TransactionDetail--mobile"
					className="items-top flex w-full justify-between space-x-4 md:items-center"
				>
					{label && <RowLabel>{label}</RowLabel>}

					<div className="flex min-w-0 grow items-center justify-end space-x-4">
						<div className="text-theme-secondary-700 md:theme-text dark:text-theme-secondary-500 flex w-full justify-end">
							{children}
						</div>

						{extra || <></>}
					</div>
				</div>
			}
			desktopContent={
				<>
					<div data-testid="TransactionDetail--desktop" className="w-40 flex-1 space-y-2 whitespace-nowrap">
						{label && (
							<div className="no-ligatures text-theme-secondary-500 dark:text-theme-secondary-700 text-sm font-semibold">
								{label}
							</div>
						)}

						<div className="flex items-center font-semibold">{children}</div>
					</div>

					{extra || <></>}
				</>
			}
		/>
	</TransactionDetailStyled>
);

TransactionDetail.displayName = "TransactionDetail";
