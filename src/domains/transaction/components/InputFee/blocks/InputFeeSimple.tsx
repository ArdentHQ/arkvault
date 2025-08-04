import React from "react";

import { Amount } from "@/app/components/Amount";
import { ButtonGroup, ButtonGroupOption } from "@/app/components/ButtonGroup";
import { Skeleton } from "@/app/components/Skeleton";
import { InputFeeSimpleProperties, InputFeeOption } from "@/domains/transaction/components/InputFee/InputFee.contracts";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { useConfirmationTimes } from "@/domains/transaction/components/InputFee/use-confirmation-times";

export const InputFeeSimple: React.FC<InputFeeSimpleProperties> = ({
	options,
	onChange,
	selectedOption,
	ticker,
	exchangeTicker,
	showConvertedValues,
	loading,
	blockTime,
}: InputFeeSimpleProperties) => {
	const { t } = useTranslation();

	const { byFeeType } = useConfirmationTimes({ blockTime });

	return (
		<ButtonGroup className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
			{Object.entries(options).map(([optionValue, { label, displayValue, displayValueConverted }]) => {
				const isSelected = optionValue === selectedOption;

				return (
					<ButtonGroupOption
						key={optionValue}
						value={displayValue}
						isSelected={() => optionValue === selectedOption}
						className="group dark:border-theme-dark-700 dark:group-hover:bg-theme-dark-700 dark:aria-checked:border-theme-dark-400 dark:aria-checked:bg-theme-dark-800 dim:border-theme-dim-700 dim-hover:bg-theme-dim-700 dim-hover:text-theme-dim-50 dim:aria-checked:border-theme-dim-navy-800 dim:aria-checked:bg-theme-dim-navy-950 dim:aria-checked:text-theme-dim-navy-50 p-0"
						setSelectedValue={() => onChange(optionValue as InputFeeOption)}
					>
						<div
							className={cn(
								"text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 group-hover:dim:text-theme-dim-50 flex w-full flex-col transition-all",
								{
									"dark:group-hover:text-theme-dark-50 dim:text-theme-dim-navy-50": !isSelected,
								},
							)}
						>
							<div className="flex items-center justify-between p-3 sm:flex-col sm:items-start sm:justify-start sm:space-y-2">
								<div
									className={cn("text-sm leading-[17px] sm:leading-5", {
										"text-theme-navy-700 dark:text-theme-dark-50 dim:text-theme-dim-50": isSelected,
									})}
								>
									{label}
								</div>

								{loading && <Skeleton width={100} className="h-4" />}

								{!loading && (
									<div className="flex justify-between sm:w-full">
										{showConvertedValues && (
											<span className="text-xs leading-[15px]">
												~
												<Amount ticker={exchangeTicker} value={displayValueConverted} />
											</span>
										)}
										<span
											className={cn(
												"text-theme-secondary-500 ml-1 text-xs leading-[15px] transition-all sm:hidden",
												{
													"dark:text-theme-dark-500 dim:text-theme-dim-200": !isSelected,
													"dim:text-theme-dim-navy-600": isSelected,
													hidden: !showConvertedValues,
												},
											)}
										>
											(
										</span>
										<Amount
											ticker={ticker}
											value={displayValue}
											className={cn("text-xs leading-[15px] transition-all", {
												"dark:group-hover:text-theme-dark-200 dark:text-theme-dark-500 dim:text-theme-dim-200 group-hover:dim:text-theme-dim-50":
													!isSelected,
												"dim:text-theme-dim-navy-600": isSelected,
												"text-theme-secondary-500": showConvertedValues,
											})}
										/>
										<span
											className={cn(
												"text-theme-secondary-500 text-xs leading-[15px] transition-all sm:hidden",
												{
													"dark:text-theme-dark-500 dim:text-theme-dim-200": !isSelected,
													"dim:text-theme-dim-navy-600": isSelected,
													hidden: !showConvertedValues,
												},
											)}
										>
											)
										</span>
									</div>
								)}
							</div>
							<div
								className={cn(
									"text-theme-secondary-700 dark:text-theme-dark-200 flex w-full justify-between px-3 py-2 text-xs leading-[15px] font-semibold transition-all",
									{
										"bg-theme-navy-100 dark:bg-theme-dark-500 dim:bg-theme-dim-navy-900 dim:text-theme-dim-navy-600":
											isSelected,
										"bg-theme-navy-50 dark:bg-theme-dark-800 dark:group-hover:bg-theme-dark-600 dark:group-hover:text-theme-dark-50 dim:bg-theme-dim-800 dim:text-theme-dim-200 group-hover:dim:bg-theme-dim-600 group-hover:dim:text-theme-dim-50":
											!isSelected,
									},
								)}
							>
								<span>{t("COMMON.CONFIRMATION_TIME_LABEL")}</span>
								<span>
									{t("COMMON.CONFIRMATION_TIME", {
										time: byFeeType(label),
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
