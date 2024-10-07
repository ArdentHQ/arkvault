import { Contracts } from "@ardenthq/sdk-profiles";
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
	transferTransactionId: string|undefined;
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
					{t("EXCHANGE.TRANSACTION_ID")}: {exchangeTransaction.orderId()}
				</span>
				<span className="flex text-theme-primary-300 dark:text-theme-secondary-600">
					<Clipboard variant="icon" data={exchangeTransaction.orderId()}>
						<Icon name="Copy" />
					</Clipboard>
				</span>
			</div>

			<div className="mt-3 flex flex-col rounded-xl border border-theme-secondary-300 px-6 py-5 dark:border-theme-secondary-800">
				<div className="flex flex-col space-y-2">
					<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
						{t("EXCHANGE.EXCHANGE_FORM.YOU_SEND")}
					</span>
					<Amount
						value={exchangeTransaction.input().amount}
						ticker={exchangeTransaction.input().ticker}
						className="text-lg font-semibold"
					/>
				</div>

				<div className="mt-4 flex flex-col space-y-2 border-t border-theme-secondary-300 pt-4 dark:border-theme-secondary-800">
					<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
						{t("EXCHANGE.TO_ADDRESS")}
					</span>
					<div className="flex items-center space-x-2 whitespace-nowrap text-lg font-semibold">
						<TruncateMiddleDynamic value={exchangeTransaction.input().address} className="no-ligatures" />
						<span className="flex text-theme-primary-300 dark:text-theme-secondary-600">
							<Clipboard variant="icon" data={exchangeTransaction.input().address}>
								<Icon name="Copy" />
							</Clipboard>
						</span>
					</div>
				</div>

				{transferTransactionId &&
					<div
						className="mt-4 flex flex-col space-y-2 border-t border-theme-secondary-300 pt-4 dark:border-theme-secondary-800">
						<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
							{t("EXCHANGE.ARK_TRANSACTION_ID")}
						</span>
						<div className="flex items-center space-x-2 whitespace-nowrap text-lg font-semibold">
							<TruncateMiddleDynamic value={transferTransactionId} className="no-ligatures"/>
							<span className="flex text-theme-primary-300 dark:text-theme-secondary-600">
								<Clipboard variant="icon" data={transferTransactionId}>
									<Icon name="Copy"/>
								</Clipboard>
							</span>
						</div>
					</div>}
			</div>

			<ExchangeStatus exchangeTransaction={exchangeTransaction}/>

			<div
				className="-mx-10 border-t border-dashed border-theme-secondary-300 px-10 pt-6 dark:border-theme-secondary-800"/>

			<div className="flex flex-col space-y-4">
				<div className="flex flex-col space-y-2">
					<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
						{t("EXCHANGE.EXCHANGE_FORM.YOU_GET")}
					</span>
					<span>
						≈{" "}
						<Amount
							value={exchangeTransaction.output().amount}
							ticker={exchangeTransaction.output().ticker}
							className="font-semibold"
						/>
					</span>
				</div>

				<div className="flex flex-col space-y-2">
					<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
						{t("EXCHANGE.TO_ADDRESS")}
					</span>
					<div className="flex items-center space-x-2 whitespace-nowrap font-semibold">
						<TruncateMiddleDynamic value={exchangeTransaction.output().address} className="no-ligatures" />
						<span className="flex text-theme-primary-300 dark:text-theme-secondary-600">
							<Clipboard variant="icon" data={exchangeTransaction.output().address}>
								<Icon name="Copy" />
							</Clipboard>
						</span>
					</div>
				</div>
			</div>

			<div className="mt-6 rounded-lg bg-theme-secondary-100 px-6 py-3 text-xs dark:bg-theme-secondary-800">
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
