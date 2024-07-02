import cn from "classnames";
import React, { useMemo, VFC } from "react";
import { useTranslation } from "react-i18next";

import { Circle } from "@/app/components/Circle";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";

import { BaseTransactionRowModeProperties, TransactionRowModeProperties } from "./TransactionRowMode.contracts";
import { TransactionRowRecipientIcon } from "./TransactionRowRecipientIcon";

export const BaseTransactionRowMode: VFC<BaseTransactionRowModeProperties> = ({
	type,
	isSent,
	isReturn,
	address,
	isCompact,
	...properties
}) => {
	const { t } = useTranslation();

	const iconSize = isCompact ? "xs" : "lg";

	const { modeIconName, tooltipContent, modeCircleStyle } = useMemo(() => {
		if (isReturn && (type === "transfer" || type === "multiPayment")) {
			return {
				modeCircleStyle: "border-theme-success-200 text-theme-success-600 dark:border-theme-success-600",
				modeIconName: "Return",
				tooltipContent: t("TRANSACTION.RETURN"),
			};
		}

		if (isSent) {
			return {
				modeCircleStyle: "border-theme-danger-100 text-theme-danger-400 dark:border-theme-danger-400",
				modeIconName: "Sent",
				tooltipContent: t("TRANSACTION.SENT"),
			};
		}

		return {
			modeCircleStyle: "border-theme-success-200 text-theme-success-600 dark:border-theme-success-600",
			modeIconName: "Received",
			tooltipContent: t("TRANSACTION.RECEIVED"),
		};
	}, [isSent, isReturn, t, type]);

	const shadowClasses =
		"ring-theme-background group-hover:ring-theme-secondary-100 group-hover:bg-theme-secondary-100 dark:group-hover:ring-black dark:group-hover:bg-black";

	return (
		<div
			data-testid="TransactionRowMode"
			className={cn("flex items-center", isCompact ? "space-x-2" : "-space-x-1")}
			{...properties}
		>
			<Tooltip content={tooltipContent}>
				{isCompact ? (
					<span className={cn("flex h-5 w-5 items-center border-0", modeCircleStyle)}>
						<Icon name={modeIconName} size="lg" />
					</span>
				) : (
					<Circle size={iconSize} className={cn(shadowClasses, modeCircleStyle)}>
						<Icon name={modeIconName} size={iconSize} />
					</Circle>
				)}
			</Tooltip>

			<TransactionRowRecipientIcon recipient={address} type={type} isCompact={isCompact} />
		</div>
	);
};

export const TransactionRowMode: VFC<TransactionRowModeProperties> = ({
	transaction,
	transactionType,
	address,
	isCompact,
	...properties
}) => (
	<BaseTransactionRowMode
		isCompact={isCompact}
		isSent={transaction.isSent() || transaction.isMultiPayment()}
		isReturn={
			transaction.sender() === transaction.wallet().address() &&
			transaction.isReturn() &&
			!transaction.isMultiPayment()
		}
		type={transactionType || transaction.type()}
		address={address || transaction.sender()}
		{...properties}
	/>
);
