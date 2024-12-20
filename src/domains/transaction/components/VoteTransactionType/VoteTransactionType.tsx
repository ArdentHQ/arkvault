import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { Label } from "@/app/components/Label";
import { Address } from "@/app/components/Address";

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

export const VoteTransactionType = ({
	unvotes,
	votes,
	showValidator,
}: {
	unvotes: VoteRegistryItem[];
	votes: VoteRegistryItem[];
	showValidator?: boolean;
}) => {
	const { t } = useTranslation();

	const voteCategory = getVoteCategory(votes, unvotes);

	const categoryLabels = {
		swap: t("TRANSACTION.TRANSACTION_TYPES.VOTE"),
		unvote: t("TRANSACTION.TRANSACTION_TYPES.UNVOTE"),
		vote: t("TRANSACTION.TRANSACTION_TYPES.VOTE"),
	};

	const showValidatorField = showValidator ? voteCategory === "vote" : voteCategory !== "swap";

	return (
		<DetailWrapper label={t("TRANSACTION.TRANSACTION_TYPE")}>
			<div className="flex flex-col gap-3" data-testid="VoteDetail">
				<div className="flex w-full items-center justify-between sm:justify-start">
					<DetailTitle className={cn("w-auto sm:min-w-36")}>{t("COMMON.CATEGORY")}</DetailTitle>
					<Label color="neutral" size="xs">
						{categoryLabels[voteCategory]}
					</Label>
				</div>

				{voteCategory === "swap" && (
					<>
						<div className="flex w-full items-center justify-between sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-36">{t("COMMON.OLD_VALIDATOR")}</DetailTitle>

							<Address
								truncateOnTable
								address={unvotes[0].wallet?.address()}
								wrapperClass="justify-start"
								addressClass="truncate text-sm font-semibold leading-[17px] text-theme-secondary-900 dark:text-theme-secondary-200 sm:text-base sm:leading-5"
							/>
						</div>

						<div className="flex w-full items-center justify-between sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-36">{t("COMMON.NEW_VALIDATOR")}</DetailTitle>

							<Address
								truncateOnTable
								address={votes[0].wallet?.address()}
								wrapperClass="justify-start"
								addressClass="truncate text-sm font-semibold leading-[17px] text-theme-secondary-900 dark:text-theme-secondary-200 sm:text-base sm:leading-5"
							/>
						</div>
					</>
				)}

				{showValidatorField && (
					<div className="flex w-full items-center justify-between sm:justify-start">
						<DetailTitle className="w-auto sm:min-w-36">{t("COMMON.VALIDATOR")}</DetailTitle>

						<Address
							truncateOnTable
							address={
								voteCategory === "vote" ? votes[0]?.wallet?.address() : unvotes[0]?.wallet?.address()
							}
							wrapperClass="justify-start"
							addressClass="truncate text-sm font-semibold leading-[17px] text-theme-secondary-900 dark:text-theme-secondary-200 sm:text-base sm:leading-5"
						/>
					</div>
				)}
			</div>
		</DetailWrapper>
	);
};
