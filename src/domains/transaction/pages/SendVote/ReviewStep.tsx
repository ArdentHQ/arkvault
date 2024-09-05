import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SendVoteStepProperties } from "./SendVote.contracts";
import { TotalAmountBox } from "@/domains/transaction/components/TotalAmountBox";
import { StepHeader } from "@/app/components/StepHeader";
import { DetailLabel, DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Address } from "@/app/components/Address";
import { Divider } from "@/app/components/Divider";
import { VoteRegistryItem } from "@ardenthq/sdk-profiles/distribution/esm/vote-registry.contract";
import { ThemeIcon } from "@/app/components/Icon";

function getVoteCategory(votes: VoteRegistryItem[], unvotes: VoteRegistryItem[]) {
	if (votes.length > 0 && unvotes.length > 0) {
		return "swap";
	}

	if (votes.length > 0) {
		return "vote";
	}

	return "unvote";
}

export const ReviewStep = ({ unvotes, votes, wallet }: SendVoteStepProperties) => {
	const { t } = useTranslation();
	const { getValues, unregister } = useFormContext();

	const { fee } = getValues();

	useEffect(() => {
		unregister("mnemonic");
	}, [unregister]);

	const voteCategory = getVoteCategory(votes, unvotes);

	const categoryLabels = {
		swap: t("TRANSACTION.TRANSACTION_TYPES.VOTE_COMBINATION"),
		unvote: t("TRANSACTION.TRANSACTION_TYPES.UNVOTE"),
		vote: t("TRANSACTION.TRANSACTION_TYPES.VOTE"),
	};

	return (
		<section data-testid="SendVote__review-step" className="space-y-3 sm:space-y-4">
			<StepHeader
				title={t("TRANSACTION.REVIEW_STEP.TITLE")}
				titleIcon={
					<ThemeIcon dimensions={[24, 24]} lightIcon="SendTransactionLight" darkIcon="SendTransactionDark" />
				}
				subtitle={t("TRANSACTION.REVIEW_STEP.DESCRIPTION")}
			/>

			<DetailWrapper label={t("TRANSACTION.ADDRESSING")}>
				<div className="flex w-full items-center justify-between gap-4 space-x-2 sm:justify-start sm:space-x-0">
					<DetailTitle className="w-auto sm:min-w-28">{t("COMMON.FROM")}</DetailTitle>
					<Address
						address={wallet.address()}
						walletName={wallet.alias()}
						walletNameClass="text-theme-text text-sm leading-[17px] sm:leading-5 sm:text-base"
						addressClass="text-theme-secondary-500 dark:text-theme-secondary-700 text-sm leading-[17px] sm:leading-5 sm:text-base"
						wrapperClass="justify-end sm:justify-start"
						showCopyButton
					/>
				</div>
			</DetailWrapper>

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
								{voteCategory === "vote" ? votes[0].wallet?.username() : unvotes[0].wallet?.username()}
							</div>
						</div>
					)}
				</div>
			</DetailWrapper>

			<div data-testid="DetailWrapper">
				<DetailLabel>{t("COMMON.TRANSACTION_SUMMARY")}</DetailLabel>
				<div className="mt-0 p-3 sm:mt-2 sm:p-0">
					<TotalAmountBox amount={0} fee={fee} ticker={wallet.currency()} />
				</div>
			</div>
		</section>
	);
};
