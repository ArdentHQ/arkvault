import cn from "classnames";
import React, { useMemo, VFC } from "react";
import { useTranslation } from "react-i18next";

import { BaseTransactionRowModeProperties, TransactionRowModeProperties } from "./TransactionRowMode.contracts";
import { TransactionRowRecipientIcon } from "./TransactionRowRecipientIcon";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";

export const BaseTransactionRowMode: VFC<BaseTransactionRowModeProperties> = ({
	type,
	isSent,
	isReturn,
	address,
	...properties
}) => {
	const { t } = useTranslation();

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

	return (
		<div data-testid="TransactionRowMode" className="flex items-center space-x-2" {...properties}>
			<Tooltip content={tooltipContent}>
				<span className={cn("flex h-5 w-5 items-center border-0", modeCircleStyle)}>
					<Icon name={modeIconName} size="lg" />
				</span>
			</Tooltip>

			<TransactionRowRecipientIcon recipient={address} type={type} />
		</div>
	);
};

export const TransactionRowMode: VFC<TransactionRowModeProperties> = ({
	transaction,
	transactionType,
	address,
	...properties
}) => (
	<BaseTransactionRowMode
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
