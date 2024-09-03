import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { SendVoteStepProperties } from "./SendVote.contracts";
import { TotalAmountBox } from "@/domains/transaction/components/TotalAmountBox";
import { StepHeader } from "@/app/components/StepHeader";
import { DetailLabel, DetailLabelText, DetailWrapper } from "@/app/components/DetailWrapper";
import { Address } from "@/app/components/Address";
import { Divider } from "@/app/components/Divider";
import { VoteRegistryItem } from "@ardenthq/sdk-profiles/distribution/esm/vote-registry.contract";

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

	return (
		<section data-testid="SendVote__review-step" className="space-y-4">
			<StepHeader
				title={t("TRANSACTION.REVIEW_STEP.TITLE")}
				subtitle={t("TRANSACTION.REVIEW_STEP.DESCRIPTION")}
			/>

			<DetailWrapper label={t("TRANSACTION.ADDRESSING")}>
				<div className="flex w-full justify-between gap-4 space-x-2 sm:justify-start sm:space-x-0">
					<DetailLabelText className="sm:min-w-28">{t("COMMON.FROM")}</DetailLabelText>
					<Address
						address={wallet.address()}
						walletName={wallet.alias()}
						walletNameClass="text-theme-text"
						wrapperClass="justify-end sm:justify-start"
						showCopyButton
					/>
				</div>
			</DetailWrapper>

			<DetailWrapper label={t("TRANSACTION.TRANSACTION_TYPE")}>
				<div className="space-y-3 sm:space-y-0">
					<div className="flex w-full justify-between gap-4 sm:justify-start">
						<DetailLabelText className="sm:min-w-28">{t("COMMON.CATEGORY")}</DetailLabelText>
						<div>{voteCategory}</div>
					</div>

					<div className="hidden sm:block">
						<Divider dashed />
					</div>

					{voteCategory === "swap" && (
						<>
							<div className="flex w-full justify-between gap-4 sm:justify-start">
								<DetailLabelText className="flex-shrink-0 sm:min-w-28">
									{t("COMMON.OLD_DELEGATE")}
								</DetailLabelText>
								<div className="no-ligatures text-md font-semibold leading-[20px] text-theme-secondary-900 dark:text-theme-secondary-200">
									{unvotes[0].wallet?.username()}
								</div>
							</div>

							<div className="hidden sm:block">
								<Divider dashed />
							</div>

							<div className="flex w-full justify-between gap-4 sm:justify-start">
								<DetailLabelText className="flex-shrink-0 sm:min-w-28">
									{t("COMMON.NEW_DELEGATE")}
								</DetailLabelText>
								<div className="no-ligatures text-md truncate font-semibold leading-[20px] text-theme-secondary-900 dark:text-theme-secondary-200">
									{votes[0].wallet?.username()}
								</div>
							</div>
						</>
					)}

					{voteCategory !== "swap" && (
						<div className="flex w-full gap-4">
							<DetailLabelText className="sm:min-w-28">{t("COMMON.DELEGATE")}</DetailLabelText>
							<div className="no-ligatures text-md font-semibold leading-[20px] text-theme-secondary-900 dark:text-theme-secondary-200">
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
