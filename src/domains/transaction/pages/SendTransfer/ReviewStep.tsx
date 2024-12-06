import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { TotalAmountBox } from "@/domains/transaction/components/TotalAmountBox";
import { TransactionAddresses } from "@/domains/transaction/components/TransactionDetail";
import { StepHeader } from "@/app/components/StepHeader";
import { Icon } from "@/app/components/Icon";
import { useActiveProfile } from "@/app/hooks";
import { DetailLabel } from "@/app/components/DetailWrapper";

interface ReviewStepProperties {
	wallet: Contracts.IReadWriteWallet;
}

export const ReviewStep: React.VFC<ReviewStepProperties> = ({ wallet }) => {
	const { t } = useTranslation();

	const { unregister, watch } = useFormContext();
	const { fee, recipients } = watch();
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
				titleIcon={
					<Icon
						dimensions={[24, 24]}
						name="DocumentView"
						data-testid="icon-DocumentView"
						className="text-theme-primary-600"
					/>
				}
				title={t("TRANSACTION.REVIEW_STEP.TITLE")}
				subtitle={t("TRANSACTION.REVIEW_STEP.DESCRIPTION")}
			/>
			<div className="-mx-3 mt-4 space-y-3 sm:mx-0 sm:space-y-4">
				<TransactionAddresses
					senderAddress={wallet.address()}
					recipients={recipients}
					profile={profile}
					network={wallet.network()}
					labelClassName="w-14 sm:w-20"
				/>

				<div className="space-y-3 sm:space-y-2">
					<DetailLabel>{t("COMMON.TRANSACTION_SUMMARY")}</DetailLabel>
					<div className="mx-3 sm:mx-0">
						<TotalAmountBox amount={amount} fee={fee} ticker={wallet.currency()} />
					</div>
				</div>
			</div>
		</section>
	);
};
