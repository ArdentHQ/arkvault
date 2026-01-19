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
		<Section {...props} className="mt-4 py-0 pt-0 first:pt-1 md:mt-0">
			<div className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-theme-dim-700 md:overflow-hidden md:rounded-xl md:border">
				<div className="flex flex-col">
					<div
						data-testid="SearchableTableWrapper__search-input"
						className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-theme-dim-700 relative flex items-center overflow-hidden rounded border border-b md:rounded-none md:border-x-0 md:border-t-0"
					>
						<div className="pointer-events-none absolute left-0 items-center pl-6">
							<Icon
								name="MagnifyingGlassAlt"
								className="text-theme-secondary-500 dim:text-theme-dim-500"
							/>
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
