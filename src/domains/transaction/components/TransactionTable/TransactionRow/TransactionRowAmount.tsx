import { isNil } from "@payvo/sdk-helpers";
import { Contracts, DTO, Helpers } from "@payvo/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { Amount, AmountLabel } from "@/app/components/Amount";
import { Tooltip } from "@/app/components/Tooltip";

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
	isTestNetwork?: boolean;
}

const BaseTransactionRowAmount: React.FC<TransactionRowProperties> = ({
	isSent,
	wallet,
	total,
	convertedTotal,
	exchangeCurrency,
	exchangeTooltip,
	isCompact,
	isTestNetwork,
}: TransactionRowProperties) => {
	const isNegative = total !== 0 && isSent;
	const TransactionAmount = (
		<AmountLabel isNegative={isNegative} value={total} ticker={wallet.currency()} isCompact={isCompact} />
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
}): JSX.Element => (
	<BaseTransactionRowAmount
		isSent={transaction.isSent()}
		wallet={transaction.wallet()}
		total={transaction.total()}
		convertedTotal={transaction.convertedTotal()}
		exchangeCurrency={exchangeCurrency}
		exchangeTooltip={exchangeTooltip}
		isCompact={isCompact}
		isTestNetwork={transaction.wallet().network().isTest()}
	/>
);

export { BaseTransactionRowAmount, TransactionRowAmount };
