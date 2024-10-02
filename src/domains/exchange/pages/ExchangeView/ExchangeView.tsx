import cn from "classnames";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Image } from "@/app/components/Image";
import { Page } from "@/app/components/Layout";
import { Spinner } from "@/app/components/Spinner";
import { useQueryParameters } from "@/app/hooks";
import { ExchangeForm } from "@/domains/exchange/components/ExchangeForm";
import { useExchangeContext } from "@/domains/exchange/contexts/Exchange";
import { Exchange } from "@/domains/exchange/exchange.contracts";
import { shouldUseDarkColors } from "@/utils/theme";

export const ExchangeView = () => {
	const queryParameters = useQueryParameters();

	const [logoUrl, setLogoUrl] = useState<string>();
	const [isReady, setIsReady] = useState<boolean>(false);

	const { provider: exchangeProvider, exchangeProviders, setProvider, fetchProviders } = useExchangeContext();

	const exchangeId = queryParameters.get("exchangeId");
	const orderId = queryParameters.get("orderId") || undefined;

	useEffect(() => {
		if (!exchangeProviders) {
			fetchProviders();
		}
	}, [exchangeProviders]);

	useEffect(() => {
		const exchange = exchangeProviders?.find((exchange: Exchange) => exchange.slug === exchangeId);

		if (exchange) {
			setProvider(exchange);
		}
	}, [exchangeId, exchangeProviders, setProvider]);

	useLayoutEffect(() => {
		if (exchangeProvider) {
			/* istanbul ignore else -- @preserve */
			if (shouldUseDarkColors()) {
				setLogoUrl(exchangeProvider.logo.dark);
			} else {
				setLogoUrl(exchangeProvider.logo.light);
			}
		}
	}, [exchangeProvider]);

	const renderSpinner = () => {
		if (!exchangeProviders || (exchangeProvider !== undefined && !isReady)) {
			return (
				<div className="py-32">
					<Spinner size="lg" />
				</div>
			);
		}

		return <></>;
	};

	const renderExchange = () => (
		<>
			<div className="mx-auto mb-8 w-24">
				{logoUrl && (
					<img
						src={logoUrl}
						alt={`${exchangeProvider?.name} Header Logo`}
						className="h-full w-full object-cover"
					/>
				)}
			</div>

			{!!exchangeProvider && <ExchangeForm orderId={orderId} onReady={() => setIsReady(true)} />}
		</>
	);

	return (
		<Page pageTitle={exchangeProvider?.name}>
			<div className="relative flex h-full w-full flex-1 flex-col items-center justify-center md:py-20">
				<div className="absolute inset-0 hidden items-center bg-[#3f4455] sm:flex sm:p-32">
					<Image name="WorldMap" className="h-full w-full" />
				</div>

				{renderSpinner()}

				<div
					className={cn(
						"relative w-full grow flex-col bg-theme-background p-6 sm:p-10 sm:max-w-xl sm:grow-0 sm:rounded-2.5xl sm:shadow-2xl lg:max-w-2xl",
						isReady ? "flex" : "hidden",
					)}
				>
					{renderExchange()}
				</div>
			</div>
		</Page>
	);
};
