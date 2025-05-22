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
	const [resetKey, setResetKey] = useState<number>(0);

	const { provider: exchangeProvider, exchangeProviders, setProvider, fetchProviders } = useExchangeContext();

	const exchangeId = queryParameters.get("exchangeId");

	const queryOrderId = queryParameters.get("orderId");

	// use `orderId` from query string on the very first render
	const orderId = queryOrderId && resetKey === 0 ? queryOrderId : undefined;

	const reset = () => {
		setResetKey(resetKey + 1);
	};

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
			<div className="mx-auto mb-2 w-24 sm:mb-8">
				{logoUrl && (
					<img
						src={logoUrl}
						alt={`${exchangeProvider?.name} Header Logo`}
						className="object-cover w-full h-full"
					/>
				)}
			</div>

			{!!exchangeProvider && (
				<ExchangeForm key={resetKey} resetForm={reset} orderId={orderId} onReady={() => setIsReady(true)} />
			)}
		</>
	);

	return (
		<Page pageTitle={exchangeProvider?.name}>
			<div className="flex relative flex-col flex-1 justify-center items-center w-full h-full md:py-20">
				<div className="hidden absolute inset-0 items-center sm:flex sm:p-32 bg-[#3f4455]">
					<Image name="WorldMap" className="w-full h-full" />
				</div>

				{renderSpinner()}

				<div
					className={cn(
						"bg-theme-background sm:rounded-2.5xl relative w-full grow flex-col p-6 sm:max-w-xl sm:grow-0 sm:p-10 sm:shadow-2xl lg:max-w-2xl",
						isReady ? "flex" : "hidden",
					)}
				>
					{renderExchange()}
				</div>
			</div>
		</Page>
	);
};
