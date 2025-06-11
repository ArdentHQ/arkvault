import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { ThemeIcon } from "@/app/components//Icon";
import { PageHeader } from "@/app/components/Header";
import { useBreakpoint } from "@/app/hooks";

interface VotesHeaderProperties {
	isSelectValidatorStep: boolean;
}

export const VotesHeader = ({ isSelectValidatorStep }: VotesHeaderProperties) => {
	const { t } = useTranslation();

	const { isMdAndAbove } = useBreakpoint();

	const headerTitle = useMemo(() => {
		if (isSelectValidatorStep) {
			return t("VOTE.VALIDATOR_TABLE.TITLE");
		}

		return t("VOTE.VOTES_PAGE.TITLE");
	}, [t, isMdAndAbove, isSelectValidatorStep]);

	return (
		<PageHeader
			title={headerTitle}
			subtitle={isSelectValidatorStep ? undefined : t("VOTE.VOTES_PAGE.SUBTITLE")}
			titleIcon={
				isSelectValidatorStep ? undefined : (
					<ThemeIcon dimensions={[54, 55]} lightIcon="VotesLight" darkIcon="VotesDark" dimIcon="VotesDim" />
				)
			}
		/>
	);
};
