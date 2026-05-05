import { OptionProperties, Select } from "@/app/components/SelectDropdown";
import { TokenNameInitials } from "@/domains/portfolio/components/Tokens/TokensSummary";
import { useTranslation } from "react-i18next";
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import { Amount } from "@/app/components/Amount";
import { Contracts } from "@/app/lib/profiles";
import { Icon } from "@/app/components/Icon";

export const SelectToken = ({
	options,
	tokens,
	className,
	onChange,
	value,
	wallet,
}: {
	options: { label: string; value: string }[];
	tokens: WalletToken[];
	className?: string;
	onChange?: (selected: { label?: string; value?: string | number }) => void;
	value?: string;
	wallet?: Contracts.IReadWriteWallet;
}) => {
	const { t } = useTranslation();
	const selectedToken = value ? options.find((token) => token.value === value) : undefined;

	return (
		<Select
			id="SelectToken__dropdown"
			defaultValue={selectedToken?.value}
			showCaret={true}
			options={options}
			placeholder={t("TOKENS.SELECT_TOKEN")}
			allowFreeInput={false}
			wrapperClassName="w-full"
			innerClassName="text-theme-secondary-900 dark:text-theme-secondary-500 dim:text-theme-dim-500"
			dropdownClassName="w-full max-w-full"
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
				let balance = wallet?.balance();
				let displaySymbol = wallet?.network().ticker();

				if (option.value !== "ARK") {
					const token = tokens.find((token) => token.token().address() === option.value);
					balance = token?.balance();
					displaySymbol = token?.token().displaySymbol();
				}

				return (
					<div className="flex items-center justify-between" data-testid="token-option">
						<div className="flex space-x-2">
							<TokenNameInitials tokenName={option.label} className="text-md h-4 w-4 p-3 leading-8" />
							<div className="break-all whitespace-normal">{option.label}</div>
						</div>

						<div className="flex items-center">
							{balance && displaySymbol && (
								<Amount
									showCompactFormat
									ticker={displaySymbol}
									value={balance}
									className="break-all whitespace-normal"
								/>
							)}
							<div className="flex w-8 justify-end">
								{option.isSelected && <Icon name="CheckmarkDouble" dimensions={[16, 16]} />}
							</div>
						</div>
					</div>
				);
			}}
		/>
	);
};
