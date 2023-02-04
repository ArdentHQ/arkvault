import React from "react";
import { useTranslation } from "react-i18next";
import { Networks } from "@ardenthq/sdk";

import { Amount, AmountLabel } from "@/app/components/Amount";
import { Circle } from "@/app/components/Circle";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import {
	TransactionDetail,
	TransactionDetailProperties,
} from "@/domains/transaction/components/TransactionDetail/TransactionDetail";
import { useBreakpoint } from "@/app/hooks";
import { NetworkIcon } from "@/domains/network/components/NetworkIcon";
import { Image } from "@/app/components/Image";

type TransactionAmountProperties = {
	amount: number;
	convertedAmount?: number;
	returnedAmount?: number;
	currency: string;
	exchangeCurrency?: string;
	isTotalAmount?: boolean;
	isSent: boolean;
	isMigration?: boolean;
	network?: Networks.Network;
} & TransactionDetailProperties;

// TODO: Use common component with musig migration success step.
const TransactionMigrationIcon = ({ network }: { network?: Networks.Network }) => {
	return (
		<div className="relative flex items-center">
			<Image name="HexagonBold" width={44} height={44} useAccentColor={false} />

			<NetworkIcon
				network={network}
				size="lg"
				className="absolute top-0 h-full w-full border-transparent text-theme-hint-600"
				showTooltip={false}
				noShadow
			/>
		</div>
	);
};

export const TransactionAmount: React.FC<TransactionAmountProperties> = ({
	amount,
	convertedAmount,
	returnedAmount,
	currency,
	exchangeCurrency,
	isTotalAmount,
	isSent,
	isMigration,
	network,
	...properties
}: TransactionAmountProperties) => {
	const { t } = useTranslation();
	const { isMdAndAbove } = useBreakpoint();

	const renderModeIcon = () => {
		if (!isMdAndAbove) {
			return null;
		}

		if (isMigration) {
			return <TransactionMigrationIcon network={network} />;
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
			<AmountLabel isNegative={isSent} value={amount} ticker={currency} hint={hint} isMigration />

			{isMdAndAbove && !!exchangeCurrency && !!convertedAmount && (
				<Amount ticker={exchangeCurrency} value={convertedAmount} className="ml-2 text-theme-secondary-400" />
			)}
		</TransactionDetail>
	);
};
