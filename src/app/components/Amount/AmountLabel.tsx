import cn from "classnames";
import React from "react";

import { Amount } from "./Amount";
import { Icon } from "@/app/components/Icon";
import { Label } from "@/app/components/Label";
import { Tooltip } from "@/app/components/Tooltip";
import { Size } from "@/types";

interface AmountLabelHintProperties {
	className: string;
	tooltipContent?: string;
}

const AmountLabelHint: React.VFC<AmountLabelHintProperties> = ({ className, tooltipContent }) => (
	<Tooltip content={tooltipContent}>
		<div
			data-testid="AmountLabel__hint"
			className={cn("flex items-center justify-center h-5 w-5", className)}
		>
			<Icon name="HintSmall" size="sm" className="dark:text-white" />
		</div>
	</Tooltip>
);

interface AmountLabelProperties {
	isNegative: boolean;
	value: number;
	ticker: string;
	hint?: string;
	size?: Size;
}

export const AmountLabel: React.VFC<AmountLabelProperties> = ({ value, ticker, isNegative, hint, size }) => {
	let labelColor = "success-bg";
	let hintClassName =
		"bg-theme-success-200 dark:bg-theme-success-700 text-theme-success-700 dark:text-white/70 dark:bg-theme-success-700";

	if (isNegative) {
		labelColor = "danger-bg";
		hintClassName = "bg-theme-danger-info-border text-theme-danger-info-text dark:text-white/70";
	}

	if (value === 0) {
		labelColor = "neutral";
		hintClassName = "";
	}

	return (
		<Label
			color={labelColor as any}
			noBorder={true}
			className={cn("rounded", {
				"pr-1.5": hint,
				"px-1.5": !hint,
			})}
			size={size}
		>
			<div className="flex space-x-1 items-center">
				{hint && <AmountLabelHint tooltipContent={hint} className={hintClassName} />}
				<Amount
					showSign={value !== 0}
					ticker={ticker}
					value={value}
					isNegative={isNegative}
					className="text-sm"
				/>
			</div>
		</Label>
	);
};
