import cn from "classnames";
import React from "react";

import { Amount } from "@/app/components/Amount";
import { Icon } from "@/app/components/Icon";
import { twMerge } from "tailwind-merge";

interface Properties {
	convertedValue: number;
	disabled: boolean;
	exchangeTicker: string;
	isDownDisabled: boolean;
	onClickDown: () => void;
	onClickUp: () => void;
	showConvertedValue: boolean;
	name?: string;
}

const ArrowButtonStyled = ({
	type = "button",
	isDownArrow,
	...props
}: React.HTMLProps<HTMLButtonElement> & { type?: "button" | "submit" | "reset"; isDownArrow?: boolean }) => (
	<button
		type={type}
		{...props}
		className={twMerge(
			"hover:bg-theme-primary-100 hover:text-theme-primary-600 active:bg-theme-primary-700 disabled:border-theme-secondary-300 disabled:bg-theme-secondary-100 disabled:text-theme-secondary-400 dark:hover:bg-theme-secondary-800 dark:hover:text-theme-primary-200 dark:disabled:border-theme-secondary-700 dark:disabled:bg-theme-secondary-800 dark:disabled:text-theme-secondary-600 flex flex-1 items-center justify-center active:text-white disabled:cursor-default",
			cn({
				"border-theme-secondary-400 dark:border-theme-secondary-700 border-b": !isDownArrow,
			}),
			props.className,
		)}
	/>
);

export const InputFeeAdvancedAddon: React.FC<Properties> = ({
	convertedValue,
	disabled,
	exchangeTicker,
	isDownDisabled,
	onClickDown,
	onClickUp,
	showConvertedValue,
	name = "InputFeeAdvanced",
}: Properties) => (
	<div className="flex items-center">
		{showConvertedValue && (
			<div className="whitespace-no-break text-theme-secondary-500 dark:text-theme-dark-500 mr-3 text-sm font-semibold">
				<Amount ticker={exchangeTicker} value={convertedValue} />
			</div>
		)}
		<div
			className={cn(
				"text-theme-secondary-700 dark:border-theme-secondary-700 dark:text-theme-dark-200 -mr-4 flex h-14 w-22 flex-row justify-between border-l sm:w-10 sm:flex-col",
				disabled ? "border-theme-secondary-300" : "border-theme-secondary-400",
			)}
		>
			<ArrowButtonStyled
				type="button"
				onClick={onClickUp}
				disabled={disabled}
				data-testid={`${name}__up`}
				className="border-r sm:border-r-0"
			>
				<Icon name="ChevronUpSmall" size="sm" />
			</ArrowButtonStyled>
			<ArrowButtonStyled
				type="button"
				onClick={onClickDown}
				disabled={disabled || isDownDisabled}
				isDownArrow
				data-testid={`${name}__down`}
			>
				<Icon name="ChevronDownSmall" size="sm" />
			</ArrowButtonStyled>
		</div>
	</div>
);
