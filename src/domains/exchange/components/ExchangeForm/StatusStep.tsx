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
import { FormItem, FormItemRow } from "./ExchangeForm.blocks";

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
				<span className="text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-200 text-xs font-semibold">
					{exchangeProvider?.name} {t("EXCHANGE.TRANSACTION_ID")}: {exchangeTransaction.orderId()}
				</span>
				<span className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 flex">
					<Clipboard variant="icon" data={exchangeTransaction.orderId()}>
						<Icon name="Copy" />
					</Clipboard>
				</span>
			</div>

			<div className="mt-2 flex flex-col space-y-2">
				<FormItem>
					<>
						<FormItemRow label={t("EXCHANGE.EXCHANGE_FORM.YOU_SEND")}>
							<Amount
								value={exchangeTransaction.input().amount}
								ticker={exchangeTransaction.input().ticker}
								className="font-semibold"
							/>
						</FormItemRow>
						<FormItemRow label={t("EXCHANGE.TO_ADDRESS")}>
							<div className="text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 flex space-x-2 font-semibold">
								<TruncateMiddleDynamic
									value={exchangeTransaction.input().address}
									className="no-ligatures"
								/>
								<span className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 flex">
									<Clipboard variant="icon" data={exchangeTransaction.input().address}>
										<Icon name="Copy" />
									</Clipboard>
								</span>
							</div>
						</FormItemRow>
						{transferTransactionId && (
							<FormItemRow label={t("EXCHANGE.ARK_TRANSACTION_ID")}>
								<div className="text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 flex space-x-2 font-semibold">
									<TruncateMiddleDynamic value={transferTransactionId} className="no-ligatures" />
									<span className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 flex">
										<Clipboard variant="icon" data={transferTransactionId}>
											<Icon name="Copy" />
										</Clipboard>
									</span>
								</div>
							</FormItemRow>
						)}
					</>
				</FormItem>
			</div>

			<ExchangeStatus exchangeTransaction={exchangeTransaction} />

			<div className="flex flex-col space-y-2">
				<FormItem>
					<FormItemRow label={t("EXCHANGE.EXCHANGE_FORM.YOU_GET")}>
						≈
						<Amount
							value={exchangeTransaction.output().amount}
							ticker={exchangeTransaction.output().ticker}
							className="font-semibold"
						/>
					</FormItemRow>

					<FormItemRow label={t("EXCHANGE.TO_ADDRESS")}>
						<div className="text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 flex space-x-2 font-semibold">
							<TruncateMiddleDynamic
								value={exchangeTransaction.output().address}
								className="no-ligatures"
							/>
							<span className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 flex">
								<Clipboard variant="icon" data={exchangeTransaction.output().address}>
									<Icon name="Copy" />
								</Clipboard>
							</span>
						</div>
					</FormItemRow>
				</FormItem>
			</div>

			<div className="bg-theme-secondary-700 dark:bg-theme-dark-950 dim:bg-theme-dim-950 dim:text-theme-dim-200 dark:text-theme-dark-200 mt-6 rounded-xl px-4 py-3 text-xs">
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
