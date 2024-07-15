import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { TotalAmountBox } from "@/domains/transaction/components/TotalAmountBox";
import {
	TransactionAddresses,
	TransactionDetailLabel,
	TransactionNetwork,
	TransactionRecipients,
	TransactionSender,
} from "@/domains/transaction/components/TransactionDetail";
import { StepHeader } from "@/app/components/StepHeader";
import { Icon } from "@/app/components/Icon";
import { useActiveProfile } from "@/app/hooks";
import { TransactionReviewDetail, TransactionReviewDetailLabel } from "../../components/TransactionReviewDetail";

interface ReviewStepProperties {
	wallet: Contracts.IReadWriteWallet;
}

export const ReviewStep: React.VFC<ReviewStepProperties> = ({ wallet }) => {
	const { t } = useTranslation();

	const { unregister, watch } = useFormContext();
	const { fee, recipients, memo } = watch();
	const profile = useActiveProfile();

	let amount = 0;

	for (const recipient of recipients) {
		amount += recipient.amount;
	}

	useEffect(() => {
		unregister("mnemonic");
	}, [unregister]);

	return (
		<section data-testid="SendTransfer__review-step">
			<StepHeader
				titleIcon={<Icon dimensions={[24, 24]} name="DocumentView" data-testid="icon-DocumentView" className="text-theme-primary-600" />}
				title={t("TRANSACTION.REVIEW_STEP.TITLE")}
				subtitle={t("TRANSACTION.REVIEW_STEP.DESCRIPTION")}
			/>
			<div className="space-y-3 sm:space-y-4 mt-4">

				<TransactionAddresses senderWallet={wallet} recipients={recipients} profile={profile} />

				{memo && (
					<TransactionReviewDetail label={t("COMMON.MEMO_SMARTBRIDGE")}>
						<p>{memo}</p>
					</TransactionReviewDetail>
				)}

				<div className="space-y-3 sm:space-y-2">
					<TransactionReviewDetailLabel>{t("COMMON.TRANSACTION_SUMMARY")}</TransactionReviewDetailLabel>
					<TotalAmountBox amount={amount} fee={fee} ticker={wallet.currency()} />
				</div>
			</div>
		</section>
	);
};
