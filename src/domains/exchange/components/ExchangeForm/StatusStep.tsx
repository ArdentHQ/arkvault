import { Contracts } from "@/app/lib/profiles";
import React, { useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";

import { ExchangeStatus } from "./StatusStep.blocks";
import { Amount } from "@/app/components/Amount";
import { Clipboard } from "@/app/components/Clipboard";
import { Icon } from "@/app/components/Icon";
import { Link } from "@/app/components/Link";
import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic";
import { useExchangeContext } from "@/domains/exchange/contexts/Exchange";
import { useOrderStatus } from "@/domains/exchange/hooks/use-order-status";
import { delay } from "@/utils/delay";

interface StatusStepProperties {
	transferTransactionId: string | undefined;
	exchangeTransaction: Contracts.IExchangeTransaction;
	onUpdate: (orderId: string, parameters: any) => void;
}

export const StatusStep = ({ exchangeTransaction, onUpdate, transferTransactionId }: StatusStepProperties) => {
	const { t } = useTranslation();

	const { provider: exchangeProvider } = useExchangeContext();

	const { checkOrderStatus, prepareParameters } = useOrderStatus();

	useEffect(() => {
		let timeout: NodeJS.Timeout;

		const fetchStatus = async () => {
			const responses = await checkOrderStatus([exchangeTransaction]);

			/* istanbul ignore else -- @preserve */
			if (responses) {
				const orderStatus = responses[exchangeTransaction.orderId()];

				// status changed
				if (orderStatus.status !== exchangeTransaction.status()) {
					const parameters = prepareParameters(exchangeTransaction, orderStatus);
					onUpdate(exchangeTransaction.id(), parameters);
				}

				// fetch again if pending
				if (orderStatus.status < Contracts.ExchangeTransactionStatus.Finished) {
					timeout = delay(fetchStatus, 15_000);
				}
			}
		};

		fetchStatus();

		return () => clearTimeout(timeout);
	}, [checkOrderStatus, exchangeTransaction, onUpdate, prepareParameters]);

	return (
		<div data-testid="ExchangeForm__status-step" className="flex flex-col">
			<div className="flex items-center space-x-1">
				<span className="text-xs font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
					{exchangeProvider?.name} {t("EXCHANGE.TRANSACTION_ID")}: {exchangeTransaction.orderId()}
				</span>
				<span className="flex text-theme-primary-300 dark:text-theme-secondary-600">
					<Clipboard variant="icon" data={exchangeTransaction.orderId()}>
						<Icon name="Copy" />
					</Clipboard>
				</span>
			</div>

			<div className="flex flex-col p-4 mt-3 rounded-xl border sm:p-6 border-theme-secondary-300 dark:border-theme-secondary-800">
				<div className="flex flex-col space-y-2">
					<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
						{t("EXCHANGE.EXCHANGE_FORM.YOU_SEND")}
					</span>
					<Amount
						value={exchangeTransaction.input().amount}
						ticker={exchangeTransaction.input().ticker}
						className="text-sm font-semibold sm:text-lg"
					/>
				</div>

				<div className="flex flex-col pt-4 mt-4 space-y-2 border-t border-theme-secondary-300 dark:border-theme-secondary-800">
					<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
						{t("EXCHANGE.TO_ADDRESS")}
					</span>
					<div className="flex items-center space-x-2 text-sm font-semibold whitespace-nowrap sm:text-lg">
						<TruncateMiddleDynamic value={exchangeTransaction.input().address} className="no-ligatures" />
						<span className="flex text-theme-primary-300 dark:text-theme-secondary-600">
							<Clipboard variant="icon" data={exchangeTransaction.input().address}>
								<Icon name="Copy" />
							</Clipboard>
						</span>
					</div>
				</div>

				{transferTransactionId && (
					<div className="flex flex-col pt-4 mt-4 space-y-2 border-t border-theme-secondary-300 dark:border-theme-secondary-800">
						<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
							{t("EXCHANGE.ARK_TRANSACTION_ID")}
						</span>
						<div className="flex items-center space-x-2 text-sm font-semibold whitespace-nowrap sm:text-lg">
							<TruncateMiddleDynamic value={transferTransactionId} className="no-ligatures" />
							<span className="flex text-theme-primary-300 dark:text-theme-secondary-600">
								<Clipboard variant="icon" data={transferTransactionId}>
									<Icon name="Copy" />
								</Clipboard>
							</span>
						</div>
					</div>
				)}
			</div>

			<ExchangeStatus exchangeTransaction={exchangeTransaction} />

			<div className="px-10 pt-6 -mx-10 border-t border-dashed border-theme-secondary-300 dark:border-theme-secondary-800" />

			<div className="flex flex-col space-y-4">
				<div className="flex flex-col space-y-2">
					<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
						{t("EXCHANGE.EXCHANGE_FORM.YOU_GET")}
					</span>
					<span className="font-semibold">
						≈
						<Amount
							value={exchangeTransaction.output().amount}
							ticker={exchangeTransaction.output().ticker}
							className="text-sm font-semibold sm:text-base"
						/>
					</span>
				</div>

				<div className="flex flex-col space-y-2">
					<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
						{t("EXCHANGE.TO_ADDRESS")}
					</span>
					<div className="flex items-center space-x-2 font-semibold whitespace-nowrap">
						<TruncateMiddleDynamic
							value={exchangeTransaction.output().address}
							className="text-sm sm:text-base no-ligatures"
						/>
						<span className="flex text-theme-primary-300 dark:text-theme-secondary-600">
							<Clipboard variant="icon" data={exchangeTransaction.output().address}>
								<Icon name="Copy" />
							</Clipboard>
						</span>
					</div>
				</div>
			</div>

			<div className="py-3 px-6 mt-6 text-xs rounded-lg bg-theme-secondary-100 dark:bg-theme-secondary-800">
				<Trans
					i18nKey="EXCHANGE.EXCHANGE_FORM.SUPPORT_INFO"
					values={{
						email: exchangeProvider?.emailAddress,
						exchange: exchangeProvider?.name,
					}}
					components={{ linkEmail: <Link to={`mailto:${exchangeProvider?.emailAddress}`} isExternal /> }}
				/>
			</div>
		</div>
	);
};
