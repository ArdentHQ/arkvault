import cn from "classnames";
import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Icon, ThemeIcon } from "@/app/components//Icon";
import { ControlButton } from "@/app/components/ControlButton";
import { Dropdown } from "@/app/components/Dropdown";
import { PageHeader } from "@/app/components/Header";
import { HeaderSearchBar } from "@/app/components/Header/HeaderSearchBar";
import { FilterWallets } from "@/domains/dashboard/components/FilterWallets";
import { FilterOption, VotesFilter } from "@/domains/vote/components/VotesFilter";
import { Divider } from "@/app/components/Divider";
import { useBreakpoint } from "@/app/hooks";

interface VotesHeaderProperties {
	isSelectDelegateStep: boolean;
}

export const VotesHeader = ({ isSelectDelegateStep }: VotesHeaderProperties) => {
	const { t } = useTranslation();

	const { isMdAndAbove } = useBreakpoint();

	// const renderPlaceholder = () => {
	// 	if (selectedAddress) {
	// 		return t("VOTE.VOTES_PAGE.SEARCH_VALIDATOR_PLACEHOLDER");
	// 	}

	// 	return t("VOTE.VOTES_PAGE.SEARCH_WALLET_PLACEHOLDER");
	// };

	// const headerExtra = () => {
	// 	if (profile.wallets().count()) {
	// 		return (
	// 			<div className="flex items-center text-theme-primary-200">
	// 				{selectedAddress && (
	// 					<>
	// 						<VotesFilter
	// 							totalCurrentVotes={totalCurrentVotes}
	// 							selectedOption={selectedFilter}
	// 							onChange={setSelectedFilter}
	// 						/>
	// 					</>
	// 				)}
	// 			</div>
	// 		);
	// 	}
	// };

	const headerTitle = useMemo(() => {
		if (isSelectDelegateStep) {
			return t("VOTE.VALIDATOR_TABLE.TITLE");
		}

		return t("VOTE.VOTES_PAGE.TITLE");
	}, [t, isMdAndAbove, isSelectDelegateStep]);

	return (
		<PageHeader
			title={headerTitle}
			subtitle={isSelectDelegateStep ? undefined : t("VOTE.VOTES_PAGE.SUBTITLE")}
			titleIcon={
				isSelectDelegateStep ? undefined : (
					<ThemeIcon dimensions={[54, 55]} lightIcon="VotesLight" darkIcon="VotesDark" />
				)
			}
		/>
	);
};
