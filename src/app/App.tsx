import "focus-visible";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import React, { useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { I18nextProvider } from "react-i18next";

import { AppRouter, GlobalStyles, Main } from "@/app/App.blocks";
import { ApplicationError } from "@/domains/error/pages";
import { ExchangeProvider } from "@/domains/exchange/contexts/Exchange";
import { initializeEnvironment } from "@/utils/environment";

import { ConfigurationProvider, EnvironmentProvider, LedgerProvider, NavigationProvider } from "./contexts";
import { ZendeskProvider } from "./contexts/Zendesk";
import { i18n as index18n } from "./i18n";

export const App: React.VFC = () => {
	/**
	 * Ensure that the Environment object will not be recreated when the state changes,
	 * as the data is stored in memory by the `DataRepository`.
	 */
	const environment = useRef(initializeEnvironment());

	const cache = createCache({ key: "emotion-cache" });
	cache.compat = true;

	return (
		<ZendeskProvider>
			<I18nextProvider i18n={index18n}>
				<EnvironmentProvider env={environment.current}>
					<ConfigurationProvider defaultConfiguration={{ profileIsSyncingExchangeRates: true }}>
						<NavigationProvider>
							<ExchangeProvider>
								<ErrorBoundary FallbackComponent={ApplicationError}>
									<LedgerProvider>
										<CacheProvider value={cache}>
											<AppRouter>
												<GlobalStyles />
												<Main />
											</AppRouter>
										</CacheProvider>
									</LedgerProvider>
								</ErrorBoundary>
							</ExchangeProvider>
						</NavigationProvider>
					</ConfigurationProvider>
				</EnvironmentProvider>
			</I18nextProvider>
		</ZendeskProvider>
	);
};
