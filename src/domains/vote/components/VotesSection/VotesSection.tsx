import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/app/components/Icon";
import { Section, SectionProperties } from "@/app/components/Layout";
import { Input } from "@/app/components/Input";
import { FilterOption, VotesFilter } from "@/domains/vote/components/VotesFilter";

export interface VotesSectionProperties extends SectionProperties {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	selectedAddress?: string;
	totalCurrentVotes?: number;
	selectedFilter?: FilterOption;
	setSelectedFilter?: (selected: FilterOption) => void;
}

export const VotesSection = ({
	children,
	selectedAddress,
	searchQuery,
	setSearchQuery,
	totalCurrentVotes = 0,
	selectedFilter,
	setSelectedFilter,
	...props
}: VotesSectionProperties) => {
	const { t } = useTranslation();

	const renderPlaceholder = () => {
		if (selectedAddress) {
			return t("VOTE.VOTES_PAGE.SEARCH_VALIDATOR_PLACEHOLDER");
		}

		return t("VOTE.VOTES_PAGE.SEARCH_WALLET_PLACEHOLDER");
	};

	return (
		<Section {...props} className="mt-4 py-0 pt-0 first:pt-1 md:mt-0">
			<div className="overflow-hidden rounded-xl border-theme-secondary-300 dark:border-theme-secondary-800 md:border">
				<div className="flex flex-col">
					<div className="relative flex items-center overflow-hidden rounded-xl border border-b border-theme-secondary-300 dark:border-theme-secondary-800 md:rounded-none md:border-x-0 md:border-t-0">
						<div className="pointer-events-none absolute left-0 items-center pl-6">
							<Icon name="MagnifyingGlassAlt" className="text-theme-secondary-500" />
						</div>

						<Input
							className="pl-12"
							placeholder={renderPlaceholder()}
							value={searchQuery}
							onChange={(event) => setSearchQuery((event.target as HTMLInputElement).value)}
							noBorder
							noShadow
						/>

						{selectedAddress != null && (
							<VotesFilter
								totalCurrentVotes={totalCurrentVotes}
								selectedOption={selectedFilter}
								onChange={setSelectedFilter}
							/>
						)}
					</div>

					<div>{children}</div>
				</div>
			</div>
		</Section>
	);
};
