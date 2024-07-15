import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { TotalAmountBox } from "@/domains/transaction/components/TotalAmountBox";
import {
	TransactionMemo,
	TransactionNetwork,
	TransactionRecipients,
	TransactionSender,
} from "@/domains/transaction/components/TransactionDetail";
import { StepHeader } from "@/app/components/StepHeader";
import { Icon } from "@/app/components/Icon";

interface ReviewStepProperties {
	wallet: Contracts.IReadWriteWallet;
}

export const ReviewStep: React.VFC<ReviewStepProperties> = ({ wallet }) => {
	const { t } = useTranslation();

	const { unregister, watch } = useFormContext();
	const { fee, recipients, memo } = watch();

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

			<TransactionNetwork network={wallet.network()} border={false} />

			<TransactionSender address={wallet.address()} network={wallet.network()} />

			<TransactionRecipients
				showAmount
				label={t("TRANSACTION.RECIPIENTS_COUNT", { count: recipients.length })}
				currency={wallet.currency()}
				recipients={recipients}
			/>

			{memo && <TransactionMemo memo={memo} />}

			<TotalAmountBox amount={amount} fee={fee} ticker={wallet.currency()} />
		</section>
	);
};
