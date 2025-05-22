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
			<div className="flex flex-col gap-3 items-center md:flex-row">
				<div className="overflow-hidden w-11 h-11 rounded-lg shrink-0">
					<img
						src={exchange.logo.thumbnail}
						alt={`${exchange.name} Logo`}
						className="object-cover w-full h-full"
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
