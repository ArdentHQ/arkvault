import { DateTime } from "@payvo/sdk-intl";
import { Contracts } from "@payvo/sdk-profiles";
import cn from "classnames";
import React, { MouseEvent } from "react";
import { useTranslation } from "react-i18next";

import { AmountLabel } from "@/app/components/Amount";
import { Circle } from "@/app/components/Circle";
import { Icon } from "@/app/components/Icon";
import { TableCell, TableRow } from "@/app/components/Table";
import { TableRemoveButton } from "@/app/components/TableRemoveButton";
import { Tooltip } from "@/app/components/Tooltip";
import { useTimeFormat } from "@/app/hooks/use-time-format";
import { useExchangeContext } from "@/domains/exchange/contexts/Exchange";

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

const getCircle = (type: string) => {
	if (type === "sent") {
		return {
			circleStyles: "border-theme-danger-100 text-theme-danger-400 dark:border-theme-danger-400",
			iconName: "Sent",
		};
	}

	return {
		circleStyles: "border-theme-success-200 text-theme-success-600 dark:border-theme-success-600",
		iconName: "Received",
	};
};

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

	const { iconName, circleStyles } = getCircle(type);

	const renderIcon = () => {
		if (isCompact) {
			return (
				<span className={cn("hidden h-5 w-5 items-center lg:flex", circleStyles)}>
					<Icon name={iconName} size="lg" />
				</span>
			);
		}

		return (
			<div className="hidden lg:flex">
				<Circle size="lg" className={circleStyles}>
					<Icon name={iconName} size="lg" />
				</Circle>
			</div>
		);
	};

	return (
		<>
			{renderIcon()}
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
	const timeFormat = useTimeFormat();

	const handleRemove = (event: MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();

		onRemove(exchangeTransaction);
	};

	return (
		<TableRow>
			<TableCell variant="start" isCompact={isCompact}>
				<Tooltip content={exchangeTransaction.orderId()} className="no-ligatures">
					<button
						type="button"
						className="link"
						onClick={() => onClick(exchangeTransaction.provider(), exchangeTransaction.orderId())}
					>
						<Icon name="MagnifyingGlassId" />
					</button>
				</Tooltip>
			</TableCell>

			<TableCell innerClassName="font-semibold" isCompact={isCompact}>
				<ExchangeTransactionProvider slug={exchangeTransaction.provider()} />
			</TableCell>

			<TableCell className="hidden lg:table-cell" isCompact={isCompact}>
				{DateTime.fromUnix(exchangeTransaction.createdAt() / 1000).format(timeFormat)}
			</TableCell>

			<TableCell innerClassName="gap-3" isCompact={isCompact}>
				<ExchangeTransactionRowAmount type="sent" data={exchangeTransaction.input()} isCompact={isCompact} />
			</TableCell>

			<TableCell innerClassName="gap-3" isCompact={isCompact}>
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
