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
import tw from "twin.macro";

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
	const { t } = useTranslation();
	const handleRemove = (event: MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();

		onRemove(exchangeTransaction);
	};

	return (
		<TableRow className="relative">
			<TableCell
				innerClassName="items-start my-0 py-3 xl:py-4 xl:min-h-0 flex-col gap-1"
				variant="start"
				isCompact={isCompact}
			>	

				<Tooltip content={exchangeTransaction.orderId()}>
					<button type="button" className="cursor-pointer w-20 truncate h-[17px]" onClick={() => onClick(exchangeTransaction.provider(), exchangeTransaction.orderId())}>
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
				isCompact={isCompact}
			>
				<TimeAgo date={DateTime.fromUnix(exchangeTransaction.createdAt() / 1000).toISOString()} />
			</TableCell>

			<TableCell innerClassName="font-semibold text-sm items-start xl:items-center mt-2 xl:mt-1" isCompact={isCompact}>
				<ExchangeTransactionProvider slug={exchangeTransaction.provider()} />
			</TableCell>

			<TableCell
				className="lg:hidden"
				innerClassName="items-end flex flex-col gap-1.5 my-3 xl:my-0"
				isCompact={isCompact}
			>
				<ExchangeTransactionRowAmount type="sent" data={exchangeTransaction.input()} isCompact={isCompact} />
				<ExchangeTransactionRowAmount
					type="received"
					data={exchangeTransaction.output()}
					isPending={exchangeTransaction.isPending()}
					isCompact={isCompact}
				/>
			</TableCell>

			<TableCell
				className="hidden lg:table-cell"
				innerClassName="gap-3 justify-end items-start xl:items-center my-3 xl:my-0"
				isCompact={isCompact}
			>
				<ExchangeTransactionRowAmount type="sent" data={exchangeTransaction.input()} isCompact={isCompact} />
			</TableCell>

			<TableCell
				className="hidden lg:table-cell"
				innerClassName="gap-3 justify-end items-start xl:items-center my-3 xl:my-0"
				isCompact={isCompact}
			>
				<ExchangeTransactionRowAmount
					type="received"
					data={exchangeTransaction.output()}
					isPending={exchangeTransaction.isPending()}
					isCompact={isCompact}
				/>
			</TableCell>

			<TableCell innerClassName="justify-center items-start xl:items-center my-3 xl:my-0" isCompact={isCompact}>
				<ExchangeTransactionsRowStatus status={exchangeTransaction.status()} />
			</TableCell>

			<TableCell
				variant="end"
				innerClassName="items-start xl:items-center justify-end text-theme-secondary-text my-3 xl:my-0"
				isCompact={isCompact}
			>
				<TableRemoveButton isCompact={isCompact} onClick={handleRemove} css={tw`pt-0 xl:pt-3`} />
			</TableCell>
		</TableRow>
	);
};
