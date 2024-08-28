import { DateTime } from "@ardenthq/sdk-intl";
import { Contracts } from "@ardenthq/sdk-profiles";
import React, { MouseEvent } from "react";
import { useTranslation } from "react-i18next";

import { AmountLabel } from "@/app/components/Amount";
import { Icon } from "@/app/components/Icon";
import { TableRow } from "@/app/components/Table";
import { TableRemoveButton } from "@/app/components/TableRemoveButton";
import { useTimeFormat } from "@/app/hooks/use-time-format";
import { useExchangeContext } from "@/domains/exchange/contexts/Exchange";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { RowWrapper, RowLabel } from "@/app/components/Table/Mobile/Row";

interface ExchangeTransactionProviderProperties {
	slug: string;
}

const ExchangeTransactionProvider: React.VFC<ExchangeTransactionProviderProperties> = ({ slug }) => {
	const { exchangeProviders } = useExchangeContext();

	if (!exchangeProviders) {
		return <></>;
	}

	const provider = exchangeProviders.find((provider) => provider.slug === slug);

	return <>{provider?.name}</>;
};

interface ExchangeTransactionRowAmountProperties {
	type: string;
	data: Contracts.ExchangeTransactionDetail;
	isPending?: boolean;
}

const ExchangeTransactionRowAmount: React.VFC<ExchangeTransactionRowAmountProperties> = ({ type, data, isPending }) => {
	const { t } = useTranslation();

	return (
		<AmountLabel
			hint={isPending ? t("EXCHANGE.EXPECTED_AMOUNT_HINT") : undefined}
			value={data.amount}
			ticker={data.ticker}
			isCompact={false}
			isNegative={type === "sent"}
			size="sm"
		/>
	);
};

interface ExchangeTransactionsRowStatusProperties {
	status: Contracts.ExchangeTransactionStatus;
}

const ExchangeTransactionsRowStatus: React.VFC<ExchangeTransactionsRowStatusProperties> = ({
	status,
}: ExchangeTransactionsRowStatusProperties) => {
	const { t } = useTranslation();

	const getIcon = (status: Contracts.ExchangeTransactionStatus) => {
		if (status === Contracts.ExchangeTransactionStatus.Finished) {
			return {
				color: "text-theme-success-600",
				name: "CircleCheckMark",
			};
		}

		if (status === Contracts.ExchangeTransactionStatus.Expired) {
			return {
				color: "text-theme-danger-400",
				name: "ClockError",
			};
		}

		if (
			status === Contracts.ExchangeTransactionStatus.Refunded ||
			status === Contracts.ExchangeTransactionStatus.Verifying
		) {
			return {
				color: "text-theme-warning-300",
				name: "CircleExclamationMark",
			};
		}

		if (status === Contracts.ExchangeTransactionStatus.Failed) {
			return {
				color: "text-theme-danger-400",
				name: "CircleCross",
			};
		}

		return {
			color: "text-theme-warning-300",
			name: "Clock",
		};
	};

	const { name, color } = getIcon(status);

	const transactionStatus = (
		Contracts.ExchangeTransactionStatus[status] as keyof typeof Contracts.ExchangeTransactionStatus
	).toUpperCase();

	return (
		<span className="flex items-center space-x-2 text-theme-secondary-700 dark:text-theme-secondary-200">
			<span>{t(`EXCHANGE.STATUS.${transactionStatus}`)}</span>
			<Icon name={name} size="lg" className={color} />
		</span>
	);
};

interface ExchangeTransactionsRowMobileProperties {
	exchangeTransaction: Contracts.IExchangeTransaction;
	onClick: (providerId: string, orderId: string) => void;
	onRemove: (exchangeTransaction: Contracts.IExchangeTransaction) => void;
}

export const ExchangeTransactionsRowMobile: React.VFC<ExchangeTransactionsRowMobileProperties> = ({
	exchangeTransaction,
	onClick,
	onRemove,
}) => {
	const timeFormat = useTimeFormat();

	const { t } = useTranslation();

	const handleRemove = (event: MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();

		onRemove(exchangeTransaction);
	};

	return (
		<TableRow onClick={() => onClick(exchangeTransaction.provider(), exchangeTransaction.orderId())}>
			<td data-testid="TableRow__mobile" className="flex-col space-y-4 py-4">
				<RowWrapper>
					<RowLabel>{t("COMMON.TX_ID")}</RowLabel>

					{exchangeTransaction.orderId() ? (
						<button
							type="button"
							className="link font-semibold"
							onClick={() => onClick(exchangeTransaction.provider(), exchangeTransaction.orderId())}
						>
							<TruncateMiddle text={exchangeTransaction.orderId()} />
						</button>
					) : (
						<span className="text-theme-secondary-700 dark:text-theme-secondary-200">NA</span>
					)}
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.RECIPIENT")}</RowLabel>

					<span className="font-semibold">
						<ExchangeTransactionProvider slug={exchangeTransaction.provider()} />
					</span>
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.TIMESTAMP")}</RowLabel>

					{DateTime.fromUnix(exchangeTransaction.createdAt() / 1000).format(timeFormat)}
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.FROM")}</RowLabel>

					<ExchangeTransactionRowAmount type="sent" data={exchangeTransaction.input()} />
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.TO")}</RowLabel>

					<ExchangeTransactionRowAmount
						type="received"
						data={exchangeTransaction.output()}
						isPending={exchangeTransaction.isPending()}
					/>
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.STATUS")}</RowLabel>

					<ExchangeTransactionsRowStatus status={exchangeTransaction.status()} />
				</RowWrapper>

				<RowWrapper>
					<TableRemoveButton
						className="w-full cursor-pointer sm:ml-auto sm:w-auto"
						isCompact={false}
						onClick={handleRemove}
					/>
				</RowWrapper>
			</td>
		</TableRow>
	);
};
