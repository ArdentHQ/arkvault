import { DetailDivider, DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { Label } from "@/app/components/Label";

type VoteRegistryItem = Contracts.VoteRegistryItem;

export function getVoteCategory(votes: VoteRegistryItem[], unvotes: VoteRegistryItem[]): "swap" | "vote" | "unvote" {
	if (votes.length > 0 && unvotes.length > 0) {
		return "swap";
	}

	if (votes.length > 0) {
		return "vote";
	}

	return "unvote";
}

export const VoteTransactionType = ({ unvotes, votes }: { unvotes: VoteRegistryItem[]; votes: VoteRegistryItem[] }) => {
	const { t } = useTranslation();

	const voteCategory = getVoteCategory(votes, unvotes);

	const categoryLabels = {
		swap: t("TRANSACTION.TRANSACTION_TYPES.VOTE_COMBINATION"),
		unvote: t("TRANSACTION.TRANSACTION_TYPES.UNVOTE"),
		vote: t("TRANSACTION.TRANSACTION_TYPES.VOTE"),
	};

	return (
		<DetailWrapper label={t("TRANSACTION.TRANSACTION_TYPE")}>
			<div className="space-y-3 sm:space-y-0" data-testid="VoteDetail">
				<div className="flex w-full items-center justify-between sm:justify-start">
					<DetailTitle
						className={cn("w-auto", {
							"sm:min-w-24": voteCategory !== "swap",
							"sm:min-w-32": voteCategory === "swap",
						})}
					>
						{t("COMMON.CATEGORY")}
					</DetailTitle>
					<Label color="neutral" size="xs">
						{categoryLabels[voteCategory]}
					</Label>
				</div>

				<DetailDivider />

				{voteCategory === "swap" && (
					<>
						<div className="flex w-full items-center justify-between sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-32">{t("COMMON.OLD_VALIDATOR")}</DetailTitle>
							<div className="no-ligatures truncate text-sm font-semibold leading-[17px] text-theme-secondary-900 dark:text-theme-secondary-200 sm:text-base sm:leading-5">
								{unvotes[0].wallet?.username()}
							</div>
						</div>

						<DetailDivider />

						<div className="flex w-full items-center justify-between sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-32">{t("COMMON.NEW_VALIDATOR")}</DetailTitle>
							<div className="no-ligatures truncate text-sm font-semibold leading-[17px] text-theme-secondary-900 dark:text-theme-secondary-200 sm:text-base sm:leading-5">
								{votes[0].wallet?.username()}
							</div>
						</div>
					</>
				)}

				{voteCategory !== "swap" && (
					<div className="flex w-full items-center justify-between sm:justify-start">
						<DetailTitle className="w-auto sm:min-w-24">{t("COMMON.VALIDATOR")}</DetailTitle>
						<div className="no-ligatures truncate text-sm font-semibold leading-[17px] text-theme-secondary-900 dark:text-theme-secondary-200 sm:text-base sm:leading-5">
							{voteCategory === "vote" ? votes[0]?.wallet?.username() : unvotes[0]?.wallet?.username()}
						</div>
					</div>
				)}
			</div>
		</DetailWrapper>
	);
};
