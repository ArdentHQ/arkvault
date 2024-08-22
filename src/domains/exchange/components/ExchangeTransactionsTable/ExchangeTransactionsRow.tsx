import { DateTime } from "@ardenthq/sdk-intl";
import { Contracts } from "@ardenthq/sdk-profiles";
import React, { MouseEvent } from "react";
import { useTranslation } from "react-i18next";

import { AmountLabel } from "@/app/components/Amount";
import { Icon } from "@/app/components/Icon";
import { TableCell, TableRow } from "@/app/components/Table";
import { TableRemoveButton } from "@/app/components/TableRemoveButton";
import { Tooltip } from "@/app/components/Tooltip";
import { useExchangeContext } from "@/domains/exchange/contexts/Exchange";
import { Address } from "@/app/components/Address";
import { TimeAgo } from "@/app/components/TimeAgo";

const ExchangeTransactionProvider = ({ slug }: { slug: string }) => {
	const { exchangeProviders } = useExchangeContext();

	if (!exchangeProviders) {
		return <></>;
	}

	const provider = exchangeProviders.find((provider) => provider.slug === slug);

	return <span>{provider?.name}</span>;
};

interface ExchangeTransactionsRowStatusProperties {
	status: Contracts.ExchangeTransactionStatus;
}

const ExchangeTransactionRowAmount = ({
	type,
	data,
	isCompact,
	isPending,
}: {
	type: string;
	data: Contracts.ExchangeTransactionDetail;
	isCompact: boolean;
	isPending?: boolean;
}) => {
	const { t } = useTranslation();

	return (
		<>
			<AmountLabel
				hint={isPending ? t("EXCHANGE.EXPECTED_AMOUNT_HINT") : undefined}
				value={data.amount}
				ticker={data.ticker}
				isCompact={isCompact}
				isNegative={type === "sent"}
			/>
		</>
	);
};

const ExchangeTransactionsRowStatus: React.FC<ExchangeTransactionsRowStatusProperties> = ({
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
			color: "text-theme-secondary-500 dark:text-theme-secondary-700",
			name: "Clock",
		};
	};

	const { name, color } = getIcon(status);
	const transactionStatus = (
		Contracts.ExchangeTransactionStatus[status] as keyof typeof Contracts.ExchangeTransactionStatus
	).toUpperCase();
	return (
		<Tooltip content={t(`EXCHANGE.STATUS.${transactionStatus}`)}>
			<span>
				<Icon name={name} size="lg" className={color} />
			</span>
		</Tooltip>
	);
};

interface ExchangeTransactionsRowProperties {
	exchangeTransaction: Contracts.IExchangeTransaction;
	isCompact: boolean;
	onClick: (providerId: string, orderId: string) => void;
	onRemove: (exchangeTransaction: Contracts.IExchangeTransaction) => void;
}

export const ExchangeTransactionsRow = ({
	exchangeTransaction,
	isCompact,
	onClick,
	onRemove,
}: ExchangeTransactionsRowProperties) => {
	const handleRemove = (event: MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();

		onRemove(exchangeTransaction);
	};

	return (
		<TableRow className="relative">
			<TableCell variant="start" isCompact={isCompact}>
				<Tooltip content={exchangeTransaction.orderId()}>
					<button
						type="button"
						className="w-full max-w-20 cursor-pointer"
						onClick={() => onClick(exchangeTransaction.provider(), exchangeTransaction.orderId())}
					>
						<Address
							address={exchangeTransaction.orderId()}
							truncateOnTable
							addressClass="text-theme-primary-600 text-sm"
						/>
					</button>
				</Tooltip>
			</TableCell>

			<TableCell className="hidden text-sm lg:table-cell" isCompact={isCompact}>
				<TimeAgo date={DateTime.fromUnix(exchangeTransaction.createdAt() / 1000).toISOString()} />
			</TableCell>

			<TableCell innerClassName="font-semibold text-sm" isCompact={isCompact}>
				<ExchangeTransactionProvider slug={exchangeTransaction.provider()} />
			</TableCell>

			<TableCell innerClassName="gap-3 justify-end" isCompact={isCompact}>
				<ExchangeTransactionRowAmount type="sent" data={exchangeTransaction.input()} isCompact={isCompact} />
			</TableCell>

			<TableCell innerClassName="gap-3 justify-end" isCompact={isCompact}>
				<ExchangeTransactionRowAmount
					type="received"
					data={exchangeTransaction.output()}
					isPending={exchangeTransaction.isPending()}
					isCompact={isCompact}
				/>
			</TableCell>

			<TableCell innerClassName="justify-center" isCompact={isCompact}>
				<ExchangeTransactionsRowStatus status={exchangeTransaction.status()} />
			</TableCell>

			<TableCell variant="end" innerClassName="justify-end text-theme-secondary-text" isCompact={isCompact}>
				<TableRemoveButton isCompact={isCompact} onClick={handleRemove} />
			</TableCell>
		</TableRow>
	);
};
