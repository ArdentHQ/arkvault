import { OptionProperties, Select } from "@/app/components/SelectDropdown";
import { TokenNameInitials } from "@/domains/portfolio/components/Tokens/TokensSummary";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const SelectToken = ({
	tokens,
	className,
	onChange,
	defaultTokenValue,
}: {
	tokens: { label: string; value: string }[];
	className?: string;
	onChange?: (tokenContractAddress?: string) => void;
	defaultTokenValue?: string;
}) => {
	const { t } = useTranslation();

	const defaultToken = defaultTokenValue ? tokens.find((token) => token.value === defaultTokenValue) : undefined;

	const [selectedToken, setSelectedToken] = useState<OptionProperties | undefined>(defaultToken);

	return (
		<Select
			id="SelectToken__dropdown"
			showCaret={true}
			defaultValue={selectedToken?.value as string | undefined}
			options={tokens}
			placeholder={t("TOKENS.SELECT_TOKEN")}
			allowFreeInput={false}
			innerClassName="text-theme-secondary-900 dark:text-theme-secondary-500 dim:text-theme-dim-500"
			className={className}
			onChange={(option: OptionProperties) => {
				onChange?.(option?.value as string | undefined);
				setSelectedToken(option);
			}}
			addons={{
				start: {
					content: (
						<div className="flex items-center">
							{selectedToken && (
								<TokenNameInitials
									tokenName={selectedToken.label}
									className="text-md h-8 w-8 p-3 leading-8"
								/>
							)}
						</div>
					),
				},
			}}
			renderLabel={(option) => (
				<div className="flex items-center space-x-2" data-testid="token-option">
					<TokenNameInitials tokenName={option.label} className="text-md h-8 w-8 p-3 leading-8" />
					<div>{option.label}</div>
				</div>
			)}
		/>
	);
};
