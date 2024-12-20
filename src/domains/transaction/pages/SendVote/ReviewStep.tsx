import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SendVoteStepProperties } from "./SendVote.contracts";
import { TotalAmountBox } from "@/domains/transaction/components/TotalAmountBox";
import { StepHeader } from "@/app/components/StepHeader";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Address } from "@/app/components/Address";
import { ThemeIcon } from "@/app/components/Icon";
import { VoteTransactionType } from "@/domains/transaction/components/VoteTransactionType";
import cn from "classnames";

export const ReviewStep = ({ unvotes, votes, wallet }: SendVoteStepProperties) => {
	const { t } = useTranslation();
	const { getValues, unregister } = useFormContext();

	const { fee } = getValues();

	useEffect(() => {
		unregister("mnemonic");
	}, [unregister]);

	return (
		<section data-testid="SendVote__review-step">
			<StepHeader
				title={t("TRANSACTION.REVIEW_STEP.TITLE")}
				titleIcon={
					<ThemeIcon
						dimensions={[24, 24]}
						lightIcon="SendTransactionLight"
						darkIcon="SendTransactionDark"
						greenDarkIcon="SendTransactionDarkGreen"
						greenLightIcon="SendTransactionLightGreen"
					/>
				}
				subtitle={t("TRANSACTION.REVIEW_STEP.DESCRIPTION")}
			/>
			<div className="-mx-3 mt-4 space-y-3 sm:mx-0 sm:space-y-4">
				<DetailWrapper label={t("TRANSACTION.ADDRESSING")}>
					<div className="flex w-full items-center justify-between gap-4 space-x-2 sm:justify-start sm:gap-0 sm:space-x-0">
						<DetailTitle className={cn("w-auto sm:min-w-36")}>{t("COMMON.FROM")}</DetailTitle>
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
						<TotalAmountBox amount={0} fee={fee} ticker={wallet.currency()} />
					</div>
				</div>
			</div>
		</section>
	);
};
