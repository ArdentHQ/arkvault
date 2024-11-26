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
	isPending,
}: {
	type: string;
	data: Contracts.ExchangeTransactionDetail;
	isPending?: boolean;
}) => {
	const { t } = useTranslation();

	return (
		<>
			<AmountLabel
				hint={isPending ? t("EXCHANGE.EXPECTED_AMOUNT_HINT") : undefined}
				value={data.amount}
				ticker={data.ticker}
				isNegative={type === "sent"}
				isCompact={true}
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
			color: "text-theme-warning-300",
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
	onClick: (providerId: string, orderId: string) => void;
	onRemove: (exchangeTransaction: Contracts.IExchangeTransaction) => void;
}

export const ExchangeTransactionsRow = ({
	exchangeTransaction,
	onClick,
	onRemove,
}: ExchangeTransactionsRowProperties) => {
	const { t } = useTranslation();
	const handleRemove = (event: MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();

		onRemove(exchangeTransaction);
	};

	return (
		<TableRow className="relative">
			<TableCell
				innerClassName="items-start my-0 flex-col gap-1 min-h-[66px] py-3 lg:my-1 lg:min-h-11 lg:py-0 xl:pt-3"
				variant="start"
			>
				<Tooltip content={exchangeTransaction.orderId()}>
					<button
						type="button"
						className="h-5 w-20 cursor-pointer truncate"
						onClick={() => onClick(exchangeTransaction.provider(), exchangeTransaction.orderId())}
					>
						{exchangeTransaction.orderId() ? (
							<Address
								address={exchangeTransaction.orderId()}
								truncateOnTable
								addressClass="text-theme-primary-600 text-sm"
							/>
						) : (
							<span className="text-sm font-semibold text-theme-secondary-500">
								{t("COMMON.NOT_AVAILABLE")}
							</span>
						)}
					</button>
				</Tooltip>

				<div className="text-xs xl:hidden">
					<TimeAgo date={DateTime.fromUnix(exchangeTransaction.createdAt() / 1000).toISOString()} />
				</div>
			</TableCell>

			<TableCell
				className="hidden text-sm xl:table-cell"
				innerClassName="items-start xl:items-center font-semibold"
			>
				<TimeAgo date={DateTime.fromUnix(exchangeTransaction.createdAt() / 1000).toISOString()} />
			</TableCell>

			<TableCell innerClassName="font-semibold text-sm items-start my-0 min-h-[66px] py-3 lg:min-h-11 xl:items-center">
				<ExchangeTransactionProvider slug={exchangeTransaction.provider()} />
			</TableCell>

			<TableCell
				className="lg:hidden"
				innerClassName="items-end flex flex-col gap-1.5 my-1 py-2.5 lg:py-2 xl:my-0"
			>
				<ExchangeTransactionRowAmount type="sent" data={exchangeTransaction.input()} />
				<ExchangeTransactionRowAmount
					type="received"
					data={exchangeTransaction.output()}
					isPending={exchangeTransaction.isPending()}
				/>
			</TableCell>

			<TableCell
				className="hidden lg:table-cell"
				innerClassName="gap-3 justify-end items-start xl:items-center my-1 py-2 xl:my-0"
			>
				<ExchangeTransactionRowAmount type="sent" data={exchangeTransaction.input()} />
			</TableCell>

			<TableCell
				className="hidden lg:table-cell"
				innerClassName="gap-3 justify-end items-start xl:items-center my-1 py-2 xl:my-0"
			>
				<ExchangeTransactionRowAmount
					type="received"
					data={exchangeTransaction.output()}
					isPending={exchangeTransaction.isPending()}
				/>
			</TableCell>

			<TableCell innerClassName="justify-center items-start xl:items-center my-0 py-3 min-h-[66px] lg:min-h-11">
				<ExchangeTransactionsRowStatus status={exchangeTransaction.status()} />
			</TableCell>

			<TableCell
				variant="end"
				innerClassName="items-start xl:items-center justify-end text-theme-secondary-text my-0 py-3 min-h-[66px] lg:min-h-11 lg:py-0 lg:pt-2.5 xl:pt-0"
			>
				<TableRemoveButton onClick={handleRemove} className="mt-0 p-1" />
			</TableCell>
		</TableRow>
	);
};
