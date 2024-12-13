import cn from "classnames";
import React, { forwardRef } from "react";
import { getStyles } from "@/domains/transaction/components/TransactionDetail/TransactionDetail.styles";
import { TransactionDetailProperties } from "@/domains/transaction/components/TransactionDetail/TransactionDetail";
import { twMerge } from "tailwind-merge";

const WalletDetailStyled = forwardRef<HTMLDivElement, TransactionDetailProperties>(
	({ border, borderPosition, padding, paddingPosition, ...props }, ref) => (
		<div
			{...props}
			ref={ref}
			className={twMerge(getStyles({ border, borderPosition, padding, paddingPosition }), props.className)}
		/>
	),
);

WalletDetailStyled.displayName = "WalletDetailStyled";

export const WalletDetail = React.forwardRef<HTMLDivElement, TransactionDetailProperties>(
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
			...properties
		}: TransactionDetailProperties,
		reference,
	) => (
		<WalletDetailStyled
			data-testid="TransactionDetail"
			border={border}
			borderPosition={borderPosition}
			padding={padding}
			paddingPosition={paddingPosition}
			className={cn("no-ligatures", className)}
			ref={reference}
			{...properties}
		>
			<div className="flex w-full items-center justify-between space-x-4">
				<div className="w-40 space-y-2 whitespace-nowrap sm:flex-1">
					{label && (
						<div className="no-ligatures text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
							{label}
						</div>
					)}

					<div className="hidden items-center font-semibold sm:flex">{children}</div>
				</div>

				<div className="flex w-full items-center justify-end overflow-auto sm:w-auto">
					<div className="flex w-full items-center justify-end overflow-auto pr-4 font-semibold sm:hidden">
						<div className="w-full truncate">{children}</div>
					</div>
					{extra || <></>}
				</div>
			</div>
		</WalletDetailStyled>
	),
);

WalletDetail.displayName = "WalletDetail";
