import "focus-visible";

import React, { useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { I18nextProvider } from "react-i18next";
import { CacheProvider } from "@emotion/react";

import createCache from "@emotion/cache";
import { ConfigurationProvider, EnvironmentProvider, LedgerProvider, NavigationProvider } from "./contexts";
import { i18n as index18n } from "./i18n";
import { ExchangeProvider } from "@/domains/exchange/contexts/Exchange";
import { AppRouter, GlobalStyles, Main } from "@/app/App.blocks";
import { initializeEnvironment } from "@/utils/environment";
import { ApplicationError } from "@/domains/error/pages";

export const App: React.VFC = () => {
	/**
	 * Ensure that the Environment object will not be recreated when the state changes,
	 * as the data is stored in memory by the `DataRepository`.
	 */
	const environment = useRef(initializeEnvironment());

	const emotionCache = createCache({ key: "emotion-cache" });
	emotionCache.compat = true;
	console.log("Loading app");

	return (
		<I18nextProvider i18n={index18n}>
			<EnvironmentProvider env={environment.current}>
				<ConfigurationProvider defaultConfiguration={{ profileIsSyncingExchangeRates: true }}>
					<NavigationProvider>
						<ExchangeProvider>
							<ErrorBoundary FallbackComponent={ApplicationError}>
								<LedgerProvider>
									<CacheProvider value={emotionCache}>
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
	);
};
