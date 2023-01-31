import cn from "classnames";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { BaseTransactionRowModeProperties, TransactionRowModeProperties } from "./TransactionRowMode.contracts";
import { TransactionRowRecipientIcon } from "./TransactionRowRecipientIcon";
import { Circle } from "@/app/components/Circle";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import { isValidMigrationTransaction } from "@/utils/polygon-migration";
import { useTheme } from "@/app/hooks";

export const BaseTransactionRowMode = ({
	type,
	isSent,
	isReturn,
	address,
	isCompact,
	isMigration,
	...properties
}: BaseTransactionRowModeProperties) => {
	const { t } = useTranslation();
	const { isDarkMode } = useTheme();

	const iconSize = isCompact ? "xs" : "lg";

	const { modeIconName, tooltipContent, modeCircleStyle } = useMemo(() => {
		if (isMigration) {
			return {
				modeCircleStyle: cn(
					"border-theme-hint-100 text-theme-hint-600 dark:border-theme-hint-300 dark:text-theme-hint-300",
					{ "bg-theme-hint-50": !isCompact && !isDarkMode },
				),
				modeIconName: "Sent",
				tooltipContent: t("TRANSACTION.MIGRATION"),
			};
		}

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

	const shadowClasses = cn("ring-theme-background group-hover:ring-theme-secondary-100 dark:group-hover:ring-black", {
		"group-hover:bg-theme-secondary-100 dark:group-hover:bg-black": !isMigration,
	});

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

export const TransactionRowMode = ({
	transaction,
	transactionType,
	address,
	isCompact,
	...properties
}: TransactionRowModeProperties) => (
	<BaseTransactionRowMode
		isCompact={isCompact}
		isSent={transaction.isSent()}
		isReturn={transaction.sender() === transaction.wallet().address() && transaction.isReturn()}
		type={transactionType || transaction.type()}
		address={address || transaction.sender()}
		isMigration={isValidMigrationTransaction(transaction)}
		{...properties}
	/>
);
