import { Contracts } from "@ardenthq/sdk-profiles";
import cn from "classnames";
import React from "react";
import { useTranslation } from "react-i18next";

import { Alert } from "@/app/components/Alert";
import { Icon } from "@/app/components/Icon";
import { Spinner } from "@/app/components/Spinner";

interface StatusIconProperties {
	label?: string;
	isDone: boolean;
	isLoading: boolean;
}

const StatusIcon = ({ label, isDone, isLoading }: StatusIconProperties) => {
	const renderIcon = () => {
		if (isDone) {
			return (
				<div
					data-testid="StatusIcon__check-mark"
					className="flex h-6 w-6 items-center justify-center rounded-full bg-theme-primary-100 text-theme-primary-600 dark:bg-theme-secondary-800 dark:text-theme-secondary-200"
				>
					<Icon name="CheckmarkSmall" size="sm" />
				</div>
			);
		}

		if (isLoading) {
			return (
				<span data-testid="StatusIcon__spinner">
					<Spinner className="!h-6 !w-6 !border-[3px]" />
				</span>
			);
		}

		return (
			<div
				data-testid="StatusIcon__empty"
				className="h-6 w-6 rounded-full border-2 border-theme-secondary-300 dark:border-theme-secondary-800"
			/>
		);
	};

	return (
		<div className="flex w-6 flex-col items-center space-y-2">
			{renderIcon()}
			<span
				className={cn(
					"whitespace-nowrap text-xs font-semibold sm:text-sm",
					isDone
						? "text-theme-secondary-700 dark:text-theme-secondary-600"
						: "text-theme-secondary-500 dark:text-theme-secondary-700",
				)}
			>
				{label}
			</span>
		</div>
	);
};

const StatusSpacer = ({ isActive }: { isActive: boolean }) => (
	<div className="flex h-6 flex-1 items-center px-2">
		<div
			className={cn(
				"h-0.5 w-full rounded-l rounded-r",
				isActive ? "bg-theme-primary-600" : "bg-theme-secondary-300 dark:bg-theme-secondary-800",
			)}
		/>
	</div>
);

const ExchangeStatus = ({ exchangeTransaction }: { exchangeTransaction: Contracts.IExchangeTransaction }) => {
	const { t } = useTranslation();

	if (exchangeTransaction.isFailed()) {
		return (
			<Alert className="my-6" variant="danger">
				{t("EXCHANGE.TRANSACTION_STATUS.FAILED")}
			</Alert>
		);
	}

	if (exchangeTransaction.isRefunded()) {
		return (
			<Alert className="my-6" variant="warning">
				{t("EXCHANGE.TRANSACTION_STATUS.REFUNDED")}
			</Alert>
		);
	}

	// if (exchangeTransaction.isVerifying()) {
	if (exchangeTransaction.status() === Contracts.ExchangeTransactionStatus.Verifying) {
		return (
			<Alert className="my-6" variant="warning">
				{t("EXCHANGE.TRANSACTION_STATUS.VERIFYING")}
			</Alert>
		);
	}

	if (exchangeTransaction.isExpired()) {
		return (
			<Alert className="my-6" variant="danger">
				{t("EXCHANGE.TRANSACTION_STATUS.EXPIRED")}
			</Alert>
		);
	}

	const status = exchangeTransaction.status();

	return (
		<div className="items-top my-6 flex justify-center px-10 sm:px-20">
			<StatusIcon
				label={t("EXCHANGE.TRANSACTION_STATUS.AWAITING_DEPOSIT")}
				isDone={status > Contracts.ExchangeTransactionStatus.Confirming}
				isLoading={
					status >= Contracts.ExchangeTransactionStatus.New &&
					status <= Contracts.ExchangeTransactionStatus.Confirming
				}
			/>

			<StatusSpacer isActive={status >= Contracts.ExchangeTransactionStatus.Exchanging} />

			<StatusIcon
				label={t("EXCHANGE.TRANSACTION_STATUS.EXCHANGING")}
				isDone={status > Contracts.ExchangeTransactionStatus.Exchanging}
				isLoading={
					status > Contracts.ExchangeTransactionStatus.Confirming &&
					status <= Contracts.ExchangeTransactionStatus.Sending
				}
			/>

			<StatusSpacer isActive={status >= Contracts.ExchangeTransactionStatus.Sending} />

			<StatusIcon
				label={t("EXCHANGE.TRANSACTION_STATUS.SENDING")}
				isDone={status > Contracts.ExchangeTransactionStatus.Sending}
				isLoading={status > Contracts.ExchangeTransactionStatus.Exchanging}
			/>
		</div>
	);
};

export { ExchangeStatus };
