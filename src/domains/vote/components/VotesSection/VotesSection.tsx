import { PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/app/components//Icon";
import { Section, SectionProperties } from "@/app/components/Layout";
import { Input } from "@/app/components/Input";

interface VotesSectionProperties extends SectionProperties {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
}

export const VotesSection = ({ children, searchQuery, setSearchQuery, ...props }: VotesSectionProperties) => {
	const { t } = useTranslation();

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
							placeholder={t("VOTE.VOTES_PAGE.SEARCH_WALLET_PLACEHOLDER")}
							value={searchQuery}
							onChange={(event) => setSearchQuery((event.target as HTMLInputElement).value)}
							noBorder
							noShadow
						/>
					</div>

					<div>{children}</div>
				</div>
			</div>
		</Section>
	);
};
