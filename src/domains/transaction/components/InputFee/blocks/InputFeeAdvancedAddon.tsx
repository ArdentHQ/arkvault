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
			"flex flex-1 cursor-pointer items-center justify-center hover:bg-theme-primary-100 hover:text-theme-primary-600 active:bg-theme-primary-700 active:text-white disabled:cursor-default disabled:border-theme-secondary-300 disabled:bg-theme-secondary-100 disabled:text-theme-secondary-400 dim:hover:bg-theme-dim-700 dim:disabled:border-theme-dim-800 dim:disabled:bg-theme-dim-800 dim:disabled:text-theme-dim-600 dim-hover:text-theme-dim-50 dim-hover:disabled:text-theme-dim-600 dark:hover:bg-theme-secondary-800 dark:hover:text-theme-primary-200 dark:disabled:border-theme-secondary-700 dark:disabled:bg-theme-secondary-800 dark:disabled:text-theme-secondary-600",
			cn({
				"border-b border-theme-secondary-400 dim:border-theme-dim-700 dark:border-theme-secondary-700":
					!isDownArrow,
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
			<div className="whitespace-no-break mr-3 text-sm font-semibold text-theme-secondary-500 dim:text-theme-dim-200 dark:text-theme-dark-500">
				<Amount ticker={exchangeTicker} value={convertedValue} />
			</div>
		)}
		<div
			className={cn(
				"-mr-4 flex h-14 w-22 flex-row justify-between border-l text-theme-secondary-700 dim:text-theme-dim-200 dark:border-theme-secondary-700 dark:text-theme-dark-200 sm:w-10 sm:flex-col",
				disabled
					? "border-theme-secondary-300 dim:border-theme-dim-700"
					: "border-theme-secondary-400 dim:border-theme-dim-700",
			)}
		>
			<ArrowButtonStyled
				onClick={onClickUp}
				disabled={disabled}
				data-testid={`${name}__up`}
				className="border-r sm:border-r-0"
			>
				<Icon name="ChevronUpSmall" size="sm" />
			</ArrowButtonStyled>
			<ArrowButtonStyled
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
