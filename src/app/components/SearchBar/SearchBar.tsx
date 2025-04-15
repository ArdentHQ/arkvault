import cn from "classnames";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { Input } from "@/app/components/Input";

interface SearchBarProperties {
	placeholder?: string;
	className?: string;
	children?: React.ReactNode;
	onSearch?: any;
}

export const SearchBar = ({ placeholder, className, children, onSearch }: SearchBarProperties) => {
	const [query, setQuery] = useState("");

	const { t } = useTranslation();

	return (
		<div data-testid="SearchBar" className={cn("bg-theme-secondary-100 px-10 pt-8 pb-8", className)}>
			<div className="bg-theme-background flex items-center rounded-xs px-10 py-6 shadow-xl">
				{children || <Icon name="MagnifyingGlass" className="text-theme-secondary-300 mr-8 w-4" />}

				<div className="border-theme-secondary-300 dark:border-theme-secondary-800 mr-4 flex-1 border-l pl-4">
					<Input
						placeholder={placeholder || t("COMMON.SEARCH_BAR.PLACEHOLDER")}
						onChange={(event) => setQuery((event.target as HTMLInputElement).value)}
						noBorder
						noShadow
					/>
				</div>

				<Button data-testid="SearchBar__button" onClick={() => onSearch(query)} className="my-1">
					<span className="text-md px-2">{t("COMMON.SEARCH_BAR.FIND_IT")}</span>
				</Button>
			</div>
		</div>
	);
};
