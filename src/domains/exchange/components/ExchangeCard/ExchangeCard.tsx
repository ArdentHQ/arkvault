import cn from "classnames";
import React from "react";

import { Card } from "@/app/components/Card";
import { Exchange } from "@/domains/exchange/exchange.contracts";

interface ExchangeCardProperties {
	exchange: Exchange;
	onClick: any;
}

export const ExchangeCard = ({ exchange, onClick }: ExchangeCardProperties) => (
	<div data-testid={`ExchangeCard--${exchange.slug}`}>
		<Card onClick={exchange.isActive ? onClick : undefined}>
			<div className="flex flex-col items-center gap-3 md:flex-row">
				<div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg">
					<img
						src={exchange.logo.thumbnail}
						alt={`${exchange.name} Logo`}
						className="h-full w-full object-cover"
					/>
				</div>

				<div className="flex flex-col truncate">
					<div
						className={cn(
							"truncate text-sm font-semibold md:text-lg",
							exchange.isActive ? "link" : "text-theme-primary-100 dark:text-theme-secondary-800",
						)}
					>
						{exchange.name}
					</div>
				</div>
			</div>
		</Card>
	</div>
);
