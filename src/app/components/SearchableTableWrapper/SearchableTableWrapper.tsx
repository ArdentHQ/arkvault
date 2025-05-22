import React from "react";
import { Icon } from "@/app/components/Icon";
import { Section, SectionProperties } from "@/app/components/Layout";
import { Input } from "@/app/components/Input";
import { useTranslation } from "react-i18next";

export interface SearchableTableWrapperProperties extends SectionProperties {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	searchPlaceholder?: string;
	extra?: React.ReactNode;
}

export const SearchableTableWrapper = ({
	children,
	searchQuery,
	setSearchQuery,
	searchPlaceholder,
	extra,
	...props
}: SearchableTableWrapperProperties) => {
	const { t } = useTranslation();

	return (
		<Section {...props} className="py-0 pt-0 mt-4 md:mt-0 first:pt-1">
			<div className="md:overflow-hidden md:rounded-xl md:border border-theme-secondary-300 dark:border-theme-secondary-800">
				<div className="flex flex-col">
					<div
						data-testid="SearchableTableWrapper__search-input"
						className="flex overflow-hidden relative items-center rounded border border-b md:rounded-none md:border-t-0 border-theme-secondary-300 md:border-x-0 dark:border-theme-secondary-800"
					>
						<div className="absolute left-0 items-center pl-6 pointer-events-none">
							<Icon name="MagnifyingGlassAlt" className="text-theme-secondary-500" />
						</div>

						<Input
							className="pl-12"
							placeholder={searchPlaceholder ?? t("COMMON.SEARCH")}
							value={searchQuery}
							onChange={(event) => setSearchQuery((event.target as HTMLInputElement).value)}
							noBorder
							noShadow
						/>

						{extra}
					</div>

					<div>{children}</div>
				</div>
			</div>
		</Section>
	);
};
