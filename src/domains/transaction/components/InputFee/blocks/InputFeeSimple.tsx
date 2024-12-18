import React from "react";

import { InputFeeSimpleSelect } from "./InputFeeSimpleSelect";
import { Amount } from "@/app/components/Amount";
import { ButtonGroup, ButtonGroupOption } from "@/app/components/ButtonGroup";
import { Skeleton } from "@/app/components/Skeleton";
import {
	InputFeeSimpleProperties,
	InputFeeSimpleValue,
} from "@/domains/transaction/components/InputFee/InputFee.contracts";
import cn from "classnames";

type ConfirmationSpeed = "Slow"|"Average"|"Fast";

const confirmationDuration:Record<ConfirmationSpeed, number> = {
	"Average": 5,
	"Fast": 2,
	"Slow": 10,
}

export const InputFeeSimple: React.FC<InputFeeSimpleProperties> = ({
	options,
	onChange,
	value,
	ticker,
	exchangeTicker,
	showConvertedValues,
	loading,
}: InputFeeSimpleProperties) => (
		<ButtonGroup className="space-y-2 sm:space-y-0 sm:space-x-2 flex-col sm:flex-row">
			{Object.entries(options).map(([optionValue, { label, displayValue, displayValueConverted }]) => {
				const isSelected = optionValue === value;

				return (<ButtonGroupOption
					key={optionValue}
					value={displayValue}
					isSelected={() => optionValue === value}
					className="p-0 dark:border-theme-dark-700 dark:aria-checked:bg-theme-dark-800 dark:aria-checked:border-theme-dark-400"
					setSelectedValue={() => onChange(optionValue as InputFeeSimpleValue)}
				>
					<div className="flex flex-col w-full dark:text-theme-dark-200">
						<div className="flex justify-between sm:justify-start sm:flex-col items-center sm:items-start sm:space-y-2 p-3">
							<div className={cn("leading-5 text-sm", {"dark:text-theme-dark-50": isSelected})}>{label}</div>
							{loading && <Skeleton width={100} className="h-4" /> }
							{!loading && <div className="sm:w-full justify-between flex">
								<Amount ticker={ticker} value={displayValue} className="text-xs leading-[15px] hidden sm:block" />
								{showConvertedValues && (
									<Amount
										ticker={exchangeTicker}
										value={displayValueConverted}
										className={cn("text-xs leading-[15px] text-theme-secondary-500", {
											"sm:dark:text-theme-dark-500": !isSelected,
										})}
									/>
								)}
							</div>}
						</div>
						<div className={cn("w-full px-3 py-2 justify-between flex text-xs leading-[15px] font-semibold text-theme-dark-200", {
							"dark:bg-theme-dark-500": isSelected,
							"dark:bg-theme-dark-800": !isSelected,
						})}>
							<span>Confirmation time</span>
							<span>~{confirmationDuration[label as ConfirmationSpeed]}s</span>
						</div>
					</div>

				</ButtonGroupOption>)
			})}
		</ButtonGroup>
	);
