import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { TotalAmountBox } from "@/domains/transaction/components/TotalAmountBox";
import {
	TransactionAddresses,
	TransactionDetail,
} from "@/domains/transaction/components/TransactionDetail";
import { StepHeader } from "@/app/components/StepHeader";

export const ReviewStep = ({ wallet, profile }: { wallet: Contracts.IReadWriteWallet, profile: Contracts.IProfile }) => {
	const { t } = useTranslation();

	const { getValues, unregister, watch } = useFormContext();
	const username = getValues("username");

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

			<TransactionAddresses
				labelClassName="w-auto sm:min-w-36"
				senderAddress={wallet.address()}
				recipients={[]}
				profile={profile}
				network={wallet.network()}
			/>

			<TransactionDetail label={t("TRANSACTION.USERNAME")}>{username}</TransactionDetail>

			<div className="mt-2">
				<TotalAmountBox amount={0} fee={fee} ticker={wallet.currency()} />
			</div>
		</section>
	);
};
