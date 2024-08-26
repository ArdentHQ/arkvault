import { DateTime } from "@ardenthq/sdk-intl";
import { Contracts } from "@ardenthq/sdk-profiles";
import React, { MouseEvent } from "react";
import { useTranslation } from "react-i18next";

import { AmountLabel } from "@/app/components/Amount";
import { Icon } from "@/app/components/Icon";
import { TableRow } from "@/app/components/Table";
import { TableRemoveButton } from "@/app/components/TableRemoveButton";
import { useExchangeContext } from "@/domains/exchange/contexts/Exchange";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { Divider } from "@/app/components/Divider";
import { TimeAgo } from "@/app/components/TimeAgo";
import { MobileCard, MobileSection } from "@/app/components/MobileCard";

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
			isCompact={true}
			isNegative={type === "sent"}
			size="sm"
		/>
	);
};

interface ExchangeTransactionsRowStatusProperties {
	status: Contracts.ExchangeTransactionStatus;
}

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

const ExchangeTransactionsRowStatusIcon: React.VFC<ExchangeTransactionsRowStatusProperties> = ({
	status,
}: ExchangeTransactionsRowStatusProperties) => {
	const { name, color } = getIcon(status);
	return (
		<span className="flex items-center space-x-2 text-theme-secondary-700 dark:text-theme-secondary-200">
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
	const { t } = useTranslation();

	const handleRemove = (event: MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();

		onRemove(exchangeTransaction);
	};

	return (
		<TableRow onClick={() => onClick(exchangeTransaction.provider(), exchangeTransaction.orderId())} border={false}>
			<MobileCard className="mb-3">
				<div className="flex h-11 w-full items-center justify-between bg-theme-secondary-100 px-4 dark:bg-black" data-testid="TableRow__mobile">
					<div className="text-sm font-semibold">
						{exchangeTransaction.orderId() ? (
							<TruncateMiddle
								className="text-theme-primary-600"
								text={exchangeTransaction.orderId()}
								maxChars={14}
							/>
						) : (
							<span className="text-theme-secondary-700 dark:text-theme-secondary-200">
								{t("COMMON.NOT_AVAILABLE")}
							</span>
						)}
					</div>

					<div className="flex flex-row items-center">
						<span className="hidden text-sm font-semibold text-theme-secondary-700 dark:text-theme-secondary-500 sm:block">
							<TimeAgo date={DateTime.fromUnix(exchangeTransaction.createdAt() / 1000).toISOString()} />
						</span>
						<div className="hidden sm:block">
							<Divider type="vertical" />
						</div>
						<ExchangeTransactionsRowStatusIcon status={exchangeTransaction.status()} />
						<Divider type="vertical" />
						<TableRemoveButton className="cursor-pointer !p-0" isCompact={true} onClick={handleRemove} data-testid="TableRow__mobile-remove-button" />
					</div>
				</div>

				<div className="flex w-full flex-col gap-4 px-4 pb-4 pt-3 sm:grid sm:grid-cols-3">
					<MobileSection title={t("COMMON.AGE")} className="sm:hidden">
						<TimeAgo date={DateTime.fromUnix(exchangeTransaction.createdAt() / 1000).toISOString()} />
					</MobileSection>

					<MobileSection title={t("COMMON.EXCHANGE")}>
						<ExchangeTransactionProvider slug={exchangeTransaction.provider()} />
					</MobileSection>

					<MobileSection title={t("COMMON.FROM")}>
						<ExchangeTransactionRowAmount type="sent" data={exchangeTransaction.input()} />
					</MobileSection>

					<MobileSection title={t("COMMON.TO")}>
						<ExchangeTransactionRowAmount
							type="received"
							data={exchangeTransaction.output()}
							isPending={exchangeTransaction.isPending()}
						/>
					</MobileSection>
				</div>
			</MobileCard>
		</TableRow>
	);
};
