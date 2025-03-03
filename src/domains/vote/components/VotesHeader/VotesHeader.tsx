import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { ThemeIcon } from "@/app/components//Icon";
import { PageHeader } from "@/app/components/Header";
import { useBreakpoint } from "@/app/hooks";

interface VotesHeaderProperties {
	isSelectDelegateStep: boolean;
}

export const VotesHeader = ({ isSelectDelegateStep }: VotesHeaderProperties) => {
	const { t } = useTranslation();

	const { isMdAndAbove } = useBreakpoint();

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
