import cn from "classnames";
import React from "react";

import { Amount } from "./Amount";
import { Icon } from "@/app/components/Icon";
import { Label } from "@/app/components/Label";
import { Tooltip } from "@/app/components/Tooltip";
import { Size } from "@/types";
import { twMerge } from "tailwind-merge";

interface AmountLabelHintProperties {
	className: string;
	isCompact?: boolean;
	tooltipContent?: string;
}

const AmountLabelHint: React.VFC<AmountLabelHintProperties> = ({ className, isCompact, tooltipContent }) => (
	<Tooltip content={tooltipContent}>
		<div
			data-testid="AmountLabel__hint"
			className={cn(
				"flex items-center justify-center",
				className,
				isCompact ? "w-5 self-stretch" : "-ml-1.5 px-2",
			)}
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
	className?: string;
	textClassName?: string
}

export const AmountLabel: React.VFC<AmountLabelProperties> = ({
	value,
	ticker,
	isCompact,
	isNegative,
	hint,
	size,
	className,
	textClassName
}) => {
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
			noBorder
			className={twMerge(
				cn("flex h-full items-center justify-center rounded", {
					"pr-1.5": hint,
					"px-1.5": !hint,
				}),
				className,
			)}
			size={size}
			data-testid="AmountLabel__wrapper"
		>
			<div className={cn("flex h-full items-center space-x-1")}>
				{hint && <AmountLabelHint tooltipContent={hint} className={hintClassName} isCompact={isCompact} />}
				<Amount
					showSign={value !== 0}
					ticker={ticker}
					value={value}
					isNegative={isNegative}
					className={cn("text-sm", textClassName)}
				/>
			</div>
		</Label>
	);
};
