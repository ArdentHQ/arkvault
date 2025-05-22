import cn from "classnames";
import React, { forwardRef } from "react";
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
} & React.HTMLAttributes<any>;

const TransactionDetailStyled = forwardRef<HTMLDivElement, TransactionDetailProperties>(
	({ border, borderPosition, padding, paddingPosition, className, ...properties }, ref) => (
		<div
			{...properties}
			ref={ref}
			className={twMerge(getStyles({ border, borderPosition, padding, paddingPosition }), className)}
		/>
	),
);

TransactionDetailStyled.displayName = "TransactionDetailStyled";

const RowLabel = ({ children }: { children: React.ReactNode }) => (
	<div className="relative m-0 font-semibold text-left select-none first:pl-0 last:pr-0 text-md group border-theme-secondary-300 text-theme-secondary-700 md:theme-text dark:border-theme-secondary-800 dark:text-theme-secondary-500">
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

export const TransactionDetail = React.forwardRef<HTMLDivElement, TransactionDetailProperties>(
	(
		{
			border = true,
			borderPosition = "top",
			children,
			className,
			extra,
			label,
			padding = true,
			paddingPosition,
			useDesktop = false,
			...properties
		}: TransactionDetailProperties,
		reference,
	) => (
		<TransactionDetailStyled
			data-testid="TransactionDetail"
			border={border}
			borderPosition={borderPosition}
			padding={padding}
			paddingPosition={paddingPosition}
			className={cn("no-ligatures", className)}
			ref={reference}
			{...properties}
		>
			<TransactionDetailContainer
				useDesktop={useDesktop}
				mobileContent={
					<div
						data-testid="TransactionDetail--mobile"
						className="flex justify-between space-x-4 w-full md:items-center items-top"
					>
						{label && <RowLabel>{label}</RowLabel>}

						<div className="flex justify-end items-center space-x-4 min-w-0 grow">
							<div className="flex justify-end w-full text-theme-secondary-700 md:theme-text dark:text-theme-secondary-500">
								{children}
							</div>

							{extra || <></>}
						</div>
					</div>
				}
				desktopContent={
					<>
						<div
							data-testid="TransactionDetail--desktop"
							className="flex-1 space-y-2 w-40 whitespace-nowrap"
						>
							{label && (
								<div className="text-sm font-semibold no-ligatures text-theme-secondary-500 dark:text-theme-secondary-700">
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
	),
);

TransactionDetail.displayName = "TransactionDetail";
