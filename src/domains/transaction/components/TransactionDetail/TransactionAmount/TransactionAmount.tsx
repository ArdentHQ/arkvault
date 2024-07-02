import React from "react";
import { useTranslation } from "react-i18next";

import { Amount, AmountLabel } from "@/app/components/Amount";
import { Circle } from "@/app/components/Circle";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import { useBreakpoint } from "@/app/hooks";
import {
	TransactionDetail,
	TransactionDetailProperties,
} from "@/domains/transaction/components/TransactionDetail/TransactionDetail";

type TransactionAmountProperties = {
	amount: number;
	convertedAmount?: number;
	returnedAmount?: number;
	currency: string;
	exchangeCurrency?: string;
	isTotalAmount?: boolean;
	isSent: boolean;
} & TransactionDetailProperties;

export const TransactionAmount: React.FC<TransactionAmountProperties> = ({
	amount,
	convertedAmount,
	returnedAmount,
	currency,
	exchangeCurrency,
	isTotalAmount,
	isSent,
	...properties
}: TransactionAmountProperties) => {
	const { t } = useTranslation();
	const { isMdAndAbove } = useBreakpoint();

	const renderModeIcon = () => {
		if (!isMdAndAbove) {
			return null;
		}

		const modeIconName = isSent ? "Sent" : "Received";
		const tooltipContent = t(`TRANSACTION.${modeIconName.toUpperCase()}`);

		const modeCircleStyle = isSent
			? "border-theme-danger-100 text-theme-danger-500 dark:border-theme-danger-400 dark:text-theme-danger-400"
			: "border-theme-success-300 text-theme-success-600 dark:border-theme-success-600";

		return (
			<Tooltip content={tooltipContent}>
				<Circle className={modeCircleStyle} size="lg">
					<Icon name={modeIconName} size="lg" />
				</Circle>
			</Tooltip>
		);
	};

	const hint = returnedAmount ? t("TRANSACTION.HINT_AMOUNT", { amount: returnedAmount, currency }) : undefined;

	return (
		<TransactionDetail
			data-testid="TransactionAmount"
			label={isTotalAmount ? t("TRANSACTION.TOTAL_AMOUNT") : t("TRANSACTION.AMOUNT")}
			extra={renderModeIcon()}
			{...properties}
		>
			<AmountLabel isNegative={isSent} value={amount} ticker={currency} hint={hint} />

			{isMdAndAbove && !!exchangeCurrency && !!convertedAmount && (
				<Amount ticker={exchangeCurrency} value={convertedAmount} className="ml-2 text-theme-secondary-400" />
			)}
		</TransactionDetail>
	);
};
