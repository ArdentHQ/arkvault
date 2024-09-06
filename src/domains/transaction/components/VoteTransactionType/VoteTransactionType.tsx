import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Divider } from "@/app/components/Divider";
import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useTranslation } from "react-i18next";

type VoteRegistryItem = Contracts.VoteRegistryItem;

function getVoteCategory(votes: VoteRegistryItem[], unvotes: VoteRegistryItem[]) {
	console.log(votes, unvotes);
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
			<div className="space-y-3 sm:space-y-0">
				<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
					<DetailTitle className="w-auto sm:min-w-28">{t("COMMON.CATEGORY")}</DetailTitle>
					<div className="flex items-center rounded bg-theme-secondary-200 px-1 py-[3px] dark:border dark:border-theme-secondary-800 dark:bg-transparent">
						<span className="text-[12px] font-semibold leading-[15px] text-theme-secondary-700 dark:text-theme-secondary-500">
							{categoryLabels[voteCategory]}
						</span>
					</div>
				</div>

				<div className="hidden sm:block">
					<Divider dashed />
				</div>

				{voteCategory === "swap" && (
					<>
						<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-28">{t("COMMON.OLD_DELEGATE")}</DetailTitle>
							<div className="no-ligatures truncate text-sm font-semibold leading-[17px] text-theme-secondary-900 dark:text-theme-secondary-200 sm:text-base sm:leading-5">
								{unvotes[0].wallet?.username()}
							</div>
						</div>

						<div className="hidden sm:block">
							<Divider dashed />
						</div>

						<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-28">{t("COMMON.NEW_DELEGATE")}</DetailTitle>
							<div className="no-ligatures truncate text-sm font-semibold leading-[17px] text-theme-secondary-900 dark:text-theme-secondary-200 sm:text-base sm:leading-5">
								{votes[0].wallet?.username()}
							</div>
						</div>
					</>
				)}

				{voteCategory !== "swap" && (
					<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
						<DetailTitle className="w-auto sm:min-w-28">{t("COMMON.DELEGATE")}</DetailTitle>
						<div className="no-ligatures truncate text-sm font-semibold leading-[17px] text-theme-secondary-900 dark:text-theme-secondary-200 sm:text-base sm:leading-5">
							{voteCategory === "vote" ? votes[0]?.wallet?.username() : unvotes[0]?.wallet?.username()}
						</div>
					</div>
				)}
			</div>
		</DetailWrapper>
	);
};
