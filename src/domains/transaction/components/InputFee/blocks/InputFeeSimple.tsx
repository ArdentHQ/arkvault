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
import { useTranslation } from "react-i18next";

type ConfirmationSpeed = "Slow" | "Average" | "Fast";

const confirmationDuration: Record<ConfirmationSpeed, number> = {
	Average: 5,
	Fast: 2,
	Slow: 10,
};

export const InputFeeSimple: React.FC<InputFeeSimpleProperties> = ({
	options,
	onChange,
	value,
	ticker,
	exchangeTicker,
	showConvertedValues,
	loading,
}: InputFeeSimpleProperties) => {
	const { t } = useTranslation();

	return (
		<ButtonGroup className="flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
			{Object.entries(options).map(([optionValue, { label, displayValue, displayValueConverted }]) => {
				const isSelected = optionValue === value;

				return (
					<ButtonGroupOption
						key={optionValue}
						value={displayValue}
						isSelected={() => optionValue === value}
						className="group p-0 dark:border-theme-dark-700 dark:group-hover:bg-theme-dark-700 dark:aria-checked:border-theme-dark-400 dark:aria-checked:bg-theme-dark-800"
						setSelectedValue={() => onChange(optionValue as InputFeeSimpleValue)}
					>
						<div
							className={cn("flex w-full flex-col transition-all dark:text-theme-dark-200", {
								"dark:group-hover:text-theme-dark-50": !isSelected,
							})}
						>
							<div className="flex items-center justify-between p-3 sm:flex-col sm:items-start sm:justify-start sm:space-y-2">
								<div className={cn("text-sm leading-5", { "dark:text-theme-dark-50": isSelected })}>
									{label}
								</div>

								{loading && <Skeleton width={100} className="h-4" />}

								{!loading && (
									<div className="flex justify-between sm:w-full">
										<Amount
											ticker={ticker}
											value={displayValue}
											className="hidden text-xs leading-[15px] sm:block"
										/>
										{showConvertedValues && (
											<Amount
												ticker={exchangeTicker}
												value={displayValueConverted}
												className={cn("text-xs leading-[15px] transition-all", {
													"dark:group-hover:text-theme-dark-200 sm:dark:text-theme-dark-500":
														!isSelected,
												})}
											/>
										)}
									</div>
								)}
							</div>
							<div
								className={cn(
									"flex w-full justify-between px-3 py-2 text-xs font-semibold leading-[15px] text-theme-dark-200 transition-all",
									{
										"dark:bg-theme-dark-500": isSelected,
										"dark:bg-theme-dark-800 dark:group-hover:bg-theme-dark-600 dark:group-hover:text-theme-dark-50":
											!isSelected,
									},
								)}
							>
								<span>Confirmation time</span>
								<span>
									{t("COMMON.CONFIRMATION_DURATION", {
										duration: confirmationDuration[label as ConfirmationSpeed],
									}).toString()}
								</span>
							</div>
						</div>
					</ButtonGroupOption>
				);
			})}
		</ButtonGroup>
	);
};
