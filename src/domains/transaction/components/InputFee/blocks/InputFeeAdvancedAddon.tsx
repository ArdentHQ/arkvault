import cn from "classnames";
import React from "react";
import tw, { styled } from "twin.macro";

import { Amount } from "@/app/components/Amount";
import { Icon } from "@/app/components/Icon";

interface Properties {
	convertedValue: number;
	disabled: boolean;
	exchangeTicker: string;
	isDownDisabled: boolean;
	onClickDown: () => void;
	onClickUp: () => void;
	showConvertedValue: boolean;
}

const ArrowButtonStyled = styled.button<{ isDownArrow?: boolean }>`
	${tw`flex flex-1 justify-center items-center`}

	${tw`hover:(
		bg-theme-primary-100 dark:bg-theme-secondary-800
		text-theme-primary-600 dark:text-theme-primary-200
	)`}

	${tw`active:(bg-theme-primary-700 text-white)`}

	${tw`disabled:(
		bg-theme-secondary-100 dark:bg-theme-secondary-800
		text-theme-secondary-400 dark:text-theme-secondary-600
		border-theme-secondary-300 dark:border-theme-secondary-700
		cursor-default
	)`}

	${({ isDownArrow }) => {
		if (!isDownArrow) {
			return tw`border-b border-theme-secondary-400 dark:border-theme-secondary-700`;
		}
	}}
`;

export const InputFeeAdvancedAddon: React.FC<Properties> = ({
	convertedValue,
	disabled,
	exchangeTicker,
	isDownDisabled,
	onClickDown,
	onClickUp,
	showConvertedValue,
}: Properties) => (
	<div className="flex items-center">
		{showConvertedValue && (
			<div className="whitespace-no-break mr-3 text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
				<Amount ticker={exchangeTicker} value={convertedValue} />
			</div>
		)}
		<div
			className={cn(
				"-mr-4 flex h-14 w-22 flex-row justify-between border-l text-theme-secondary-700 dark:border-theme-secondary-700 sm:w-10 sm:flex-col",
				disabled ? "border-theme-secondary-300" : "border-theme-secondary-400",
			)}
		>
			<ArrowButtonStyled
				type="button"
				onClick={onClickUp}
				disabled={disabled}
				data-testid="InputFeeAdvanced__up"
				className="border-r sm:border-r-0"
			>
				<Icon name="ChevronUpSmall" size="sm" />
			</ArrowButtonStyled>
			<ArrowButtonStyled
				type="button"
				onClick={onClickDown}
				disabled={disabled || isDownDisabled}
				isDownArrow
				data-testid="InputFeeAdvanced__down"
			>
				<Icon name="ChevronDownSmall" size="sm" />
			</ArrowButtonStyled>
		</div>
	</div>
);
