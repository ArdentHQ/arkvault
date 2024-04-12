import React, { useEffect, useState } from "react";
import {
	TransactionDetail,
	TransactionNetwork,
	TransactionSender,
} from "@/domains/transaction/components/TransactionDetail";

import { Contracts } from "@ardenthq/sdk-profiles";
import { StepHeader } from "@/app/components/StepHeader";
import { TotalAmountBox } from "@/domains/transaction/components/TotalAmountBox";
import { isMainsailNetwork } from "@/utils/network-utils";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TransactionPublicKey } from "../TransactionDetail/TransactionPublicKey";

export const ReviewStep = ({ wallet }: { wallet: Contracts.IReadWriteWallet }) => {
	const { t } = useTranslation();

	const { getValues, unregister, watch } = useFormContext();
	const { username, validatorPublicKey } = getValues(["username", "validatorPublicKey"]);

	const [defaultFee] = useState(() => watch("fee"));
	const fee = getValues("fee") ?? defaultFee;

	useEffect(() => {
		unregister("mnemonic");
	}, [unregister]);

	return (
		<section data-testid="DelegateRegistrationForm__review-step">
			<StepHeader
				title={t("TRANSACTION.REVIEW_STEP.TITLE")}
				subtitle={t("TRANSACTION.REVIEW_STEP.DESCRIPTION")}
			/>

			<TransactionNetwork network={wallet.network()} border={false} />

			<TransactionSender address={wallet.address()} network={wallet.network()} />

			{isMainsailNetwork(wallet.network()) && <TransactionPublicKey publicKey={validatorPublicKey} />}

			{!isMainsailNetwork(wallet.network()) && (
				<TransactionDetail label={t("TRANSACTION.DELEGATE_NAME")}>{username}</TransactionDetail>
			)}

			<div className="mt-2">
				<TotalAmountBox amount={0} fee={fee} ticker={wallet.currency()} />
			</div>
		</section>
	);
};
