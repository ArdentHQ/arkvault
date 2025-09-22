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
					className="text-theme-success-700 dark:text-theme-success-500 dim:text-theme-success-500 h-5 w-5"
				>
					<Icon name="CheckmarkSmall" size="sm" />
				</div>
			);
		}

		if (isLoading) {
			return (
				<span data-testid="StatusIcon__spinner">
					<Spinner className="h-5! w-5! border-[3px]!" color="warning" />
				</span>
			);
		}

		return (
			<div
				data-testid="StatusIcon__empty"
				className="bg-theme-secondary-200 dark:bg-theme-dark-800 dim:bg-theme-dim-800 h-5 w-5 rounded-full"
			/>
		);
	};

	return (
		<div className="relative -mt-[22px] flex items-center overflow-hidden pt-[22px] pl-[38px]">
			<span className="border-theme-secondary-300 dim:border-theme-dim-700 dark:border-theme-dark-700 absolute top-0 left-0 h-[35px] w-[26px] rounded-bl-xl border-b-2 border-l-2" />
			<span>{renderIcon()}</span>
			<span
				className={cn("ml-3 font-semibold whitespace-nowrap", {
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
		<div className="items-top mt-2 mb-6 flex flex-col justify-center space-y-4 overflow-hidden px-6 pt-1.5">
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
