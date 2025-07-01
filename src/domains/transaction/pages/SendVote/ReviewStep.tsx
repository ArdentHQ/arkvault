import React, { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SendVoteStepProperties } from "./SendVote.contracts";
import { StepHeader } from "@/app/components/StepHeader";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Address } from "@/app/components/Address";
import { ThemeIcon } from "@/app/components/Icon";
import { getVoteCategory, VoteTransactionType } from "@/domains/transaction/components/VoteTransactionType";
import cn from "classnames";
import { FormField, FormLabel } from "@/app/components/Form";
import { FeeField } from "@/domains/transaction/components/FeeField";

export const ReviewStep = ({ unvotes, votes, wallet, profile }: SendVoteStepProperties) => {
	const { t } = useTranslation();
	const { unregister } = useFormContext();

	useEffect(() => {
		unregister("mnemonic");
	}, [unregister]);

	const showFeeInput = useMemo(() => !wallet.network().chargesZeroFees(), [wallet]);

	const feeTransactionData = useMemo(
		() => ({
			unvotes: unvotes.map((vote) => ({
				amount: vote.amount,
				id: vote.wallet?.governanceIdentifier(),
			})),
			votes: votes.map((vote) => ({
				amount: vote.amount,
				id: vote.wallet?.governanceIdentifier(),
			})),
		}),
		[unvotes, votes, wallet],
	);

	const voteCategory = getVoteCategory(votes, unvotes);

	return (
		<section data-testid="SendVote__review-step">
			<StepHeader
				title={t("TRANSACTION.REVIEW_STEP.TITLE")}
				titleIcon={
					<ThemeIcon
						dimensions={[24, 24]}
						lightIcon="SendTransactionLight"
						darkIcon="SendTransactionDark"
						dimIcon="SendTransactionDim"
					/>
				}
				subtitle={t("TRANSACTION.REVIEW_STEP.DESCRIPTION")}
			/>
			<div className="-mx-3 mt-4 space-y-3 sm:mx-0 sm:space-y-4">
				<DetailWrapper label={t("TRANSACTION.ADDRESSING")}>
					<div className="flex w-full items-center justify-between gap-4 space-x-2 sm:justify-start sm:gap-0 sm:space-x-0">
						<DetailTitle
							className={cn("w-auto", {
								"sm:min-w-[132px]": voteCategory === "swap",
								"sm:min-w-[93px]": voteCategory !== "swap",
							})}
						>
							{t("COMMON.FROM")}
						</DetailTitle>
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

				<VoteTransactionType votes={votes} unvotes={unvotes} />

				<div data-testid="DetailWrapper">
					<div className="mt-0 p-3 sm:mt-2 sm:p-0">
						{showFeeInput && (
							<FormField name="fee" className="flex-1">
								<FormLabel label={t("TRANSACTION.TRANSACTION_FEE")} />
								<FeeField
									type="vote"
									data={{
										...feeTransactionData,
										voteAddresses: votes.map((vote) => vote.wallet?.address()),
									}}
									network={wallet.network()}
									profile={profile}
								/>
							</FormField>
						)}
					</div>
				</div>
			</div>
		</section>
	);
};
