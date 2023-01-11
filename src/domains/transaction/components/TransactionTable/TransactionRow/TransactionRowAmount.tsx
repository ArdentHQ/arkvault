import { isNil } from "@ardenthq/sdk-helpers";
import { Contracts, DTO, Helpers } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { Amount, AmountLabel } from "@/app/components/Amount";
import { Tooltip } from "@/app/components/Tooltip";
import { useTransaction } from "@/domains/transaction/hooks";

interface ExchangeTooltipProperties {
	value: number;
	ticker: string;
	isTestNetwork?: boolean;
	children: React.ReactNode;
}

const ExchangeTooltip: React.FC<ExchangeTooltipProperties> = ({
	value,
	ticker,
	isTestNetwork,
	children,
}: ExchangeTooltipProperties) => {
	const { t } = useTranslation();

	const exchangeAmount = (): string => {
		if (isTestNetwork) {
			return t("COMMON.NOT_AVAILABLE");
		}

		return Helpers.Currency.format(value, ticker);
	};

	return (
		<Tooltip content={exchangeAmount()} className="xl:opacity-0">
			<div data-testid="TransactionAmount__tooltip" className="flex items-center">
				{children}
			</div>
		</Tooltip>
	);
};

interface TransactionRowProperties {
	isSent: boolean;
	wallet: Contracts.IReadWriteWallet;
	total: number;
	convertedTotal?: number;
	exchangeCurrency?: string;
	exchangeTooltip?: boolean;
	isCompact?: boolean;
	isMigration?: boolean;
	isTestNetwork?: boolean;
}

const BaseTransactionRowAmount = ({
	isSent,
	wallet,
	total,
	convertedTotal,
	exchangeCurrency,
	exchangeTooltip,
	isCompact,
	isTestNetwork,
	isMigration,
}: TransactionRowProperties) => {
	const isNegative = total !== 0 && isSent;
	const { t } = useTranslation();

	const TransactionAmount = (
		<AmountLabel
			isNegative={isNegative}
			value={total}
			ticker={wallet.currency()}
			isCompact={isCompact}
			isMigration={isMigration}
			hint={isMigration ? t("TRANSACTION.MIGRATION_TO_POLYGON") : undefined}
		/>
	);

	if (!exchangeCurrency || isNil(convertedTotal)) {
		return TransactionAmount;
	}

	if (!exchangeTooltip) {
		return <Amount value={convertedTotal} ticker={exchangeCurrency} className="text-theme-secondary-text" />;
	}

	return (
		<ExchangeTooltip value={convertedTotal} ticker={exchangeCurrency} isTestNetwork={isTestNetwork}>
			{TransactionAmount}
		</ExchangeTooltip>
	);
};

const TransactionRowAmount = ({
	transaction,
	exchangeCurrency,
	exchangeTooltip,
	isCompact,
}: {
	transaction: DTO.ExtendedConfirmedTransactionData;
	exchangeCurrency?: string;
	exchangeTooltip?: boolean;
	isCompact?: boolean;
}): JSX.Element => {
	const { isMigrationTransaction } = useTransaction();

	return (
		<BaseTransactionRowAmount
			isSent={transaction.isSent()}
			wallet={transaction.wallet()}
			total={transaction.total()}
			convertedTotal={transaction.convertedTotal()}
			exchangeCurrency={exchangeCurrency}
			exchangeTooltip={exchangeTooltip}
			isCompact={isCompact}
			isTestNetwork={transaction.wallet().network().isTest()}
			isMigration={isMigrationTransaction(transaction)}
		/>
	);
};

export { BaseTransactionRowAmount, TransactionRowAmount };
