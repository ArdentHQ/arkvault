import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { TotalAmountBox } from "@/domains/transaction/components/TotalAmountBox";
import {
	TransactionDetail,
	TransactionNetwork,
	TransactionSender,
} from "@/domains/transaction/components/TransactionDetail";
import { StepHeader } from "@/app/components/StepHeader";

export const ReviewStep = ({ wallet }: { wallet: Contracts.IReadWriteWallet }) => {
	const { t } = useTranslation();

	const { getValues, unregister, watch } = useFormContext();
	const username = getValues("username");

	const previousUsername = wallet.username();

	const [defaultFee] = useState(() => watch("fee"));
	const fee = getValues("fee") ?? defaultFee;

	useEffect(() => {
		unregister("mnemonic");
	}, [unregister]);

	return (
		<section data-testid="UsernameRegistrationForm__review-step">
			<StepHeader
				title={t("TRANSACTION.REVIEW_STEP.TITLE")}
				subtitle={t("TRANSACTION.REVIEW_STEP.DESCRIPTION")}
			/>

			<TransactionNetwork network={wallet.network()} border={false} />

			<TransactionSender address={wallet.address()} network={wallet.network()} />

			{previousUsername && (
				<TransactionDetail label={t("TRANSACTION.OLD_USERNAME")}>{previousUsername}</TransactionDetail>
			)}

			<TransactionDetail label={previousUsername ? t("TRANSACTION.NEW_USERNAME") : t("TRANSACTION.USERNAME")}>
				{username}
			</TransactionDetail>

			<div className="mt-2">
				<TotalAmountBox amount={0} fee={fee} ticker={wallet.currency()} />
			</div>
		</section>
	);
};
