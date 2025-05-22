import React from "react";
import { useTranslation } from "react-i18next";

import { EmptyBlock } from "@/app/components/EmptyBlock";
import { ExchangeCard, ExchangeCardSkeleton } from "@/domains/exchange/components/ExchangeCard";
import { Exchange } from "@/domains/exchange/exchange.contracts";

interface ExchangeGridProperties {
	exchanges: Exchange[];
	isLoading: boolean;
	onClick: (exchangeId: string) => void;
}

export const ExchangeGrid = ({ exchanges, isLoading, onClick }: ExchangeGridProperties) => {
	const { t } = useTranslation();

	if (isLoading) {
		return (
			<div data-testid="ExchangeGrid">
				<div className="grid gap-3 w-full md:grid-cols-2">
					{Array.from({ length: 2 }).map((_, index) => (
						<ExchangeCardSkeleton key={index} />
					))}
				</div>
			</div>
		);
	}

	if (exchanges.length === 0) {
		return (
			<EmptyBlock data-testid="ExchangeGrid__empty-message">
				{t("EXCHANGE.PAGE_EXCHANGES.EMPTY_MESSAGE")}
			</EmptyBlock>
		);
	}

	return (
		<div data-testid="ExchangeGrid" className="grid gap-3 w-full md:grid-cols-2">
			{exchanges.map((exchange: Exchange) => (
				<ExchangeCard key={exchange.slug} exchange={exchange} onClick={() => onClick(exchange.slug)} />
			))}
		</div>
	);
};
