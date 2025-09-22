import { Contracts } from "@/app/lib/profiles";
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
					className="text-theme-success-700 dark:text-theme-success-500 dim:text-theme-success-500 flex h-4 w-4 items-center justify-center rounded-full sm:h-5 sm:w-5"
				>
					<Icon name="CheckmarkDouble" />
				</div>
			);
		}

		if (isLoading) {
			return (
				<span data-testid="StatusIcon__spinner">
					<Spinner className="h-4! w-4! border-[2px]! sm:h-5! sm:w-5! sm:border-[3px]!" color="warning" />
				</span>
			);
		}

		return (
			<div
				data-testid="StatusIcon__empty"
				className="bg-theme-secondary-200 dark:bg-theme-dark-800 dim:bg-theme-dim-800 h-4 w-4 rounded-full sm:h-5 sm:w-5"
			/>
		);
	};

	return (
		<div
			className={cn(
				"relative flex items-center overflow-hidden rounded-lg border px-3 py-2 sm:-mt-[22px] sm:rounded-none sm:border-none sm:pt-[22px] sm:pr-0 sm:pb-0 sm:pl-[38px]",
				{
					"bg-theme-secondary-100 border-theme-secondary-300 dark:border-theme-secondary-700 dim:bg-transparent dim:border-theme-secondary-700 dark:bg-transparent":
						!isDone && !isLoading,
					"bg-theme-success-100 border-theme-success-200 dark:border-theme-success-700 dim:bg-transparent dim:border-theme-success-700 dark:bg-transparent":
						isDone,
					"bg-theme-warning-50 border-theme-warning-200 dark:border-theme-warning-700 dim:bg-transparent dim:border-theme-warning-700 dark:bg-transparent":
						isLoading,
				},
			)}
		>
			<span className="border-theme-secondary-300 dim:border-theme-dim-700 dark:border-theme-dark-700 absolute top-0 left-0 hidden h-[35px] w-[26px] rounded-bl-xl border-b-2 border-l-2 sm:inline" />
			<span>{renderIcon()}</span>
			<span
				className={cn("ml-2 font-semibold whitespace-nowrap sm:ml-3", {
					"text-theme-secondary-500 dark:text-theme-dark-500 dim:text-theme-dim-500": !isDone && !isLoading,
					"text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200": isLoading,
					"text-theme-success-700 dark:text-theme-success-500 dim:text-theme-success-500": isDone,
				})}
			>
				{label}
			</span>
		</div>
	);
};

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
		<div className="items-top mt-2 mb-4 flex flex-col space-y-1 overflow-hidden pt-1.5 sm:mb-6 sm:justify-center sm:space-y-4 sm:px-6">
			<StatusIcon
				label={t("EXCHANGE.TRANSACTION_STATUS.AWAITING_DEPOSIT")}
				isDone={status > Contracts.ExchangeTransactionStatus.Confirming}
				isLoading={
					status >= Contracts.ExchangeTransactionStatus.New &&
					status <= Contracts.ExchangeTransactionStatus.Confirming
				}
			/>
			<StatusIcon
				label={t("EXCHANGE.TRANSACTION_STATUS.EXCHANGING")}
				isDone={status > Contracts.ExchangeTransactionStatus.Exchanging}
				isLoading={
					status > Contracts.ExchangeTransactionStatus.Confirming &&
					status <= Contracts.ExchangeTransactionStatus.Sending
				}
			/>

			<StatusIcon
				label={t("EXCHANGE.TRANSACTION_STATUS.SENDING")}
				isDone={status > Contracts.ExchangeTransactionStatus.Sending}
				isLoading={status > Contracts.ExchangeTransactionStatus.Exchanging}
			/>
		</div>
	);
};

export { ExchangeStatus };
