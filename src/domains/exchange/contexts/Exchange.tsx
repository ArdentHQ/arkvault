import { ExchangeService, exchangeHost } from "@/domains/exchange/services/exchange.service";
import React, { useCallback, useMemo, useState } from "react";

import { Exchange } from "@/domains/exchange/exchange.contracts";
import { camelCase } from "@/app/lib/helpers";
import { httpClient } from "@/app/services";

interface Properties {
	children: React.ReactNode;
}

const ExchangeContext = React.createContext<any>(undefined);

const useExchange = () => {
	const [provider, setProvider] = useState<Exchange | undefined>();
	const [exchangeProviders, setExchangeProviders] = useState<Exchange[] | undefined>();

	const exchangeService = useMemo<ExchangeService | undefined>(() => {
		if (provider) {
			return new ExchangeService(provider.slug, httpClient);
		}
	}, [provider]);

	const fetchProviders = useCallback(async () => {
		const transformExchanges = (exchanges: Exchange[]) =>
			exchanges.map((exchange: Exchange) => {
				const newExchange: any = {};

				for (const [key, value] of Object.entries(exchange)) {
					newExchange[camelCase(key) as string] = value;
				}

				return newExchange;
			});

		try {
			const body = await httpClient.get(exchangeHost);
			setExchangeProviders(transformExchanges(body.json().data));
		} catch {
			setExchangeProviders([]);
		}
	}, []);

	return {
		exchangeProviders,
		exchangeService,
		fetchProviders,
		provider,
		setProvider,
	};
};

export const ExchangeProvider = ({ children }: Properties) => {
	const context = useExchange();

	return <ExchangeContext.Provider value={context}>{children}</ExchangeContext.Provider>;
};

export const useExchangeContext = (): ReturnType<typeof useExchange> => {
	const context = React.useContext(ExchangeContext);
	if (context === undefined) {
		throw new Error("[useExchangeContext] Component not wrapped within a Provider");
	}
	return context;
};
