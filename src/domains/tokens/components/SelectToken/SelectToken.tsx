import { OptionProperties, Select } from "@/app/components/SelectDropdown";
import { TokenNameInitials } from "@/domains/portfolio/components/Tokens/TokensSummary";
import { useTranslation } from "react-i18next";
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import { Amount } from "@/app/components/Amount";
import { Contracts } from "@/app/lib/profiles";
import { Icon } from "@/app/components/Icon";

export const SelectToken = ({
	tokens,
	className,
	onChange,
	value,
	wallet,
}: {
	tokens: { label: string; value: string; data: any }[];
	className?: string;
	onChange?: (selected: { label?: string; value?: string | number }) => void;
	value?: string;
	wallet?: Contracts.IReadWriteWallet;
}) => {
	const { t } = useTranslation();
	const selectedToken = value ? tokens.find((token) => token.value === value) : undefined;

	return (
		<Select
			id="SelectToken__dropdown"
			defaultValue={selectedToken?.value}
			showCaret={true}
			options={tokens}
			placeholder={t("TOKENS.SELECT_TOKEN")}
			allowFreeInput={false}
			wrapperClassName="w-full"
			innerClassName="text-theme-secondary-900 dark:text-theme-secondary-500 dim:text-theme-dim-500"
			dropdownClassName="w-full max-w-full px-0"
			className={className}
			onChange={(option?: OptionProperties) => {
				onChange?.({
					label: option?.label,
					value: option?.value,
				});
			}}
			addons={{
				start: {
					content: (
						<div className="flex items-center">
							{selectedToken && (
								<TokenNameInitials
									tokenName={selectedToken.label}
									className="text-md h-6 w-6 p-3 leading-8"
								/>
							)}
						</div>
					),
				},
			}}
			renderLabel={(option) => {
				const token = option.data as WalletToken | undefined;
				const balance = token ? token.balance() : wallet?.balance();
				const displaySymbol = token ? token.token().displaySymbol() : wallet?.network().ticker();

				return (
					<div className="flex justify-between sm:justify-start">
						<div
							className="flex flex-1 flex-col justify-center gap-2 sm:flex-row sm:items-center sm:justify-between"
							data-testid="token-option"
						>
							<div className="flex items-center space-x-2">
								<TokenNameInitials
									tokenName={option.label}
									className="sm:text-md p-2.5 text-sm leading-[17px] sm:p-3 sm:leading-5"
								/>
								<div className="text-sm leading-[17px] break-all whitespace-normal sm:text-base sm:leading-5">
									{option.label}
								</div>
							</div>

							<div className="flex items-center">
								{balance && displaySymbol && (
									<Amount
										showCompactFormat
										ticker={displaySymbol}
										value={balance}
										className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 text-sm leading-[17px] break-all whitespace-normal sm:text-base sm:leading-5"
									/>
								)}
								<div className="hidden w-8 justify-end sm:flex">
									{option.isSelected && (
										<Icon
											name="CheckmarkDouble"
											dimensions={[16, 16]}
											data-testid="Icon--CheckmarkDouble"
											className="text-theme-primary-600 dark:text-theme-dark-50 dim:text-theme-dim-50"
										/>
									)}
								</div>
							</div>
						</div>
						<div className="sm:hidden">
							{option.isSelected && (
								<Icon
									name="CheckmarkDouble"
									dimensions={[16, 16]}
									data-testid="Icon--CheckmarkDouble"
									className="text-theme-primary-600 dark:text-theme-dark-50 dim:text-theme-dim-50"
								/>
							)}
						</div>
					</div>
				);
			}}
		/>
	);
};
