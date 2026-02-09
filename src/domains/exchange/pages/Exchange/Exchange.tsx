import { Page, Section } from "@/app/components/Layout";
import React, { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { Contracts } from "@/app/lib/profiles";
import { DeleteExchangeTransaction } from "@/domains/exchange/components/DeleteExchangeTransaction";
import { ExchangeGrid } from "@/domains/exchange/components/ExchangeGrid";
import { ExchangeNavigationBar } from "@/domains/exchange/components/ExchangeNavigationBar";
import { ExchangeTransactionsTable } from "@/domains/exchange/components/ExchangeTransactionsTable";
import { OrderStatusResponse } from "@/domains/exchange/exchange.contracts";
import { PageHeader } from "@/app/components/Header";
import { ThemeIcon } from "@/app/components/Icon";
import { assertExchangeTransaction } from "@/domains/exchange/utils";
import { assertString } from "@/utils/assertions";
import { delay } from "@/utils/delay";
import { toasts } from "@/app/services";
import { upperFirst } from "@/app/lib/helpers";
import { useActiveProfile } from "@/app/hooks";
import { useExchangeContext } from "@/domains/exchange/contexts/Exchange";
import { useOrderStatus } from "@/domains/exchange/hooks/use-order-status";
import { ExchangeSidePanel } from "@/domains/exchange/components/ExchangeSidePanel/ExchangeSidePanel";
import { useSearchParams } from "react-router-dom";

enum ExchangeView {
	Exchanges = "EXCHANGES",
	Transactions = "TRANSACTIONS",
}

export const Exchange = () => {
	const { t } = useTranslation();

	const activeProfile = useActiveProfile();
	const [searchParams, setSearchParams] = useSearchParams();

	const [currentView, setCurrentView] = useState<ExchangeView>(ExchangeView.Exchanges);
	const [selectedExchange, setSelectedExchange] = useState<string>();
	const [selectedExchangeTransaction, setSelectedExchangeTransaction] = useState<Contracts.IExchangeTransaction>();
	const { exchangeProviders, fetchProviders } = useExchangeContext();
	const { checkOrderStatus, prepareParameters } = useOrderStatus();

	useEffect(() => {
		let timeout: NodeJS.Timeout;

		const handleStatusChange = (orderStatus: OrderStatusResponse) => {
			const exchangeTransaction = activeProfile
				.exchangeTransactions()
				.values()
				.find(
					(exchangeTransaction: Contracts.IExchangeTransaction) =>
						exchangeTransaction.provider() === orderStatus.providerId &&
						exchangeTransaction.orderId() === orderStatus.id,
				);

			assertExchangeTransaction(exchangeTransaction);

			const parameters = prepareParameters(exchangeTransaction, orderStatus);
			activeProfile.exchangeTransactions().update(exchangeTransaction.id(), parameters);
		};

		const fetchStatus = async () => {
			const responses = await checkOrderStatus(activeProfile.exchangeTransactions().pending());

			if (responses) {
				for (const response of Object.values(responses)) {
					handleStatusChange(response);
				}
			}

			timeout = delay(fetchStatus, 15_000);
		};

		fetchStatus();

		return () => clearTimeout(timeout);
	}, [activeProfile, checkOrderStatus, prepareParameters]);

	useEffect(() => {
		const _fetchProviders = async () => fetchProviders();

		if (!exchangeProviders) {
			_fetchProviders();
		}
	}, [exchangeProviders, fetchProviders]);

	const handleLaunchExchange = (exchangeId: string) => {
		setSelectedExchange(exchangeId);
	};

	const handleViewChange = (view?: string | number) => {
		assertString(view);

		const value = ExchangeView[upperFirst(view.toLowerCase()) as keyof typeof ExchangeView];

		setCurrentView(value);
	};

	const handleDelete = (exchangeTransaction: Contracts.IExchangeTransaction) => {
		setSelectedExchangeTransaction(undefined);

		toasts.success(
			<Trans
				i18nKey="EXCHANGE.PAGE_EXCHANGES.DELETE_CONFIRMATION"
				values={{ orderId: exchangeTransaction.orderId() }}
				components={{ bold: <strong /> }}
			/>,
		);
	};

	const renderContent = () => {
		if (currentView === ExchangeView.Exchanges) {
			return (
				<ExchangeGrid
					exchanges={exchangeProviders || []}
					isLoading={!exchangeProviders}
					onClick={handleLaunchExchange}
				/>
			);
		}

		return (
			<>
				<ExchangeTransactionsTable
					exchangeTransactions={activeProfile.exchangeTransactions().values()}
					onClick={(providerId: string, orderId: string) => {
						setSelectedExchange(providerId);
						setSearchParams({ orderId });
					}}
					onRemove={(exchangeTransaction: Contracts.IExchangeTransaction) =>
						setSelectedExchangeTransaction(exchangeTransaction)
					}
				/>

				{selectedExchangeTransaction && (
					<DeleteExchangeTransaction
						isOpen={!!selectedExchangeTransaction}
						exchangeTransaction={selectedExchangeTransaction}
						profile={activeProfile}
						onCancel={() => setSelectedExchangeTransaction(undefined)}
						onClose={() => setSelectedExchangeTransaction(undefined)}
						onDelete={handleDelete}
					/>
				)}
			</>
		);
	};

	return (
		<>
			<Page pageTitle={t("EXCHANGE.PAGE_EXCHANGES.TITLE")} isBackDisabled={true} data-testid="Exchange">
				<PageHeader
					title={t("EXCHANGE.PAGE_EXCHANGES.TITLE")}
					subtitle={t("EXCHANGE.PAGE_EXCHANGES.SUBTITLE")}
					titleIcon={
						<ThemeIcon
							dimensions={[54, 55]}
							lightIcon="ExchangesLight"
							darkIcon="ExchangesDark"
							dimIcon="ExchangesDim"
						/>
					}
					mobileTitleIcon={
						<ThemeIcon
							dimensions={[24, 24]}
							lightIcon="MobileExchangesLight"
							darkIcon="MobileExchangesDark"
							dimIcon="MobileExchangesDim"
						/>
					}
				/>

				<Section className="pt-0" innerClassName="px-6 lg:px-10">
					<ExchangeNavigationBar currentView={currentView} onChange={handleViewChange} />
					{selectedExchange && (
						<ExchangeSidePanel
							exchangeId={selectedExchange}
							onOpenChange={(open) => {
								if (!open) {
									setSelectedExchange(undefined);
									searchParams.delete("orderId");
									setSearchParams(searchParams);
								}
							}}
						/>
					)}
					{renderContent()}
				</Section>
			</Page>
		</>
	);
};
