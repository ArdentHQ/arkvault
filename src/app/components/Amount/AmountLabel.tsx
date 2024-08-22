import cn from "classnames";
import React from "react";

import { Amount } from "./Amount";
import { Icon } from "@/app/components/Icon";
import { Label } from "@/app/components/Label";
import { Tooltip } from "@/app/components/Tooltip";
import { Size } from "@/types";

interface AmountLabelHintProperties {
	className: string;
	isCompact?: boolean;
	tooltipContent?: string;
}

const AmountLabelHint: React.VFC<AmountLabelHintProperties> = ({ className, isCompact, tooltipContent }) => (
	<Tooltip content={tooltipContent}>
		<div
			data-testid="AmountLabel__hint"
			className={cn("flex items-center justify-center", className, isCompact ? "h-5 w-5" : "-ml-1.5 px-2")}
		>
			<Icon name="HintSmall" size="sm" className="dark:text-white" />
		</div>
	</Tooltip>
);

interface AmountLabelProperties {
	isCompact?: boolean;
	isNegative: boolean;
	value: number;
	ticker: string;
	hint?: string;
	size?: Size;
}

export const AmountLabel: React.VFC<AmountLabelProperties> = ({ value, ticker, isCompact, isNegative, hint, size }) => {
	let labelColor = "success-bg";
	let hintClassName = "bg-theme-success-500 dark:bg-theme-success-700";

	if (isNegative) {
		labelColor = "danger-bg";
		hintClassName = "bg-[#A56D4C] dark:bg-[#AA6868] text-white";
	}

	if (value === 0) {
		labelColor = "neutral";
		hintClassName = "";
	}

	return (
		<Label
			color={labelColor as any}
			noBorder={isCompact}
			className={cn("rounded", {
				"pr-1.5": hint,
				"px-1.5": !hint,
			})}
			size={size}
		>
			<div className={cn("flex space-x-1", isCompact ? "items-center" : "items-stretch")}>
				{hint && <AmountLabelHint tooltipContent={hint} className={hintClassName} isCompact={isCompact} />}
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
