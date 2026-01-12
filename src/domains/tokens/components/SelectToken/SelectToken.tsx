import { OptionProperties, Select } from "@/app/components/SelectDropdown";
import { TokenNameInitials } from "@/domains/portfolio/components/Tokens/TokensSummary";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const SelectToken = ({ tokens, className }: { tokens: { name: string }[]; className?: string }) => {
	const { t } = useTranslation();
	const defaultToken = tokens.length === 1 ? { label: tokens[0].name, value: tokens[0].name } : undefined;
	const [selectedToken, setSelectedToken] = useState<OptionProperties | undefined>(defaultToken);

	return (
		<Select
			id="SelectToken__dropdown"
			showCaret={true}
			defaultValue={selectedToken?.value as string | undefined}
			options={tokens.map((token) => ({
				label: token.name,
				value: token.name,
			}))}
			placeholder={t("TOKENS.SELECT_TOKEN")}
			allowFreeInput={false}
			innerClassName="text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-200"
			className={className}
			onChange={(option: OptionProperties) => setSelectedToken(option)}
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
				<div className="flex items-center space-x-2">
					<TokenNameInitials tokenName={option.label} className="text-md h-8 w-8 p-3 leading-8" />
					<div>{option.label}</div>
				</div>
			)}
		/>
	);
};
