import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";

import { useTranslation } from "react-i18next";
import { useWalletAlias } from "@/app/hooks";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import {
	TransactionAmount,
	TransactionFee,
	TransactionRecipients,
} from "@/domains/transaction/components/TransactionDetail";
import { TransactionSuccessful } from "@/domains/transaction/components/TransactionSuccessful";

interface SummaryStepProperties {
	profile: Contracts.IProfile;
	senderWallet: Contracts.IReadWriteWallet;
	transaction: DTO.ExtendedSignedTransactionData;
}

export const SummaryStep = ({ profile, senderWallet, transaction }: SummaryStepProperties): JSX.Element => {
	const { getWalletAlias } = useWalletAlias();
	const { t } = useTranslation();

	const recipients: RecipientItem[] = transaction.recipients().map((recipient) => {
		const { alias, isDelegate } = getWalletAlias({
			address: recipient.address,
			network: senderWallet.network(),
			profile,
		});

		return { alias, isDelegate, ...recipient };
	});

	return (
		<TransactionSuccessful transaction={transaction} senderWallet={senderWallet}>
			<TransactionRecipients
				showAmount
				label={t("TRANSACTION.RECIPIENTS_COUNT", { count: recipients.length })}
				currency={senderWallet.currency()}
				recipients={recipients}
			/>

			<TransactionAmount
				amount={transaction.amount()}
				currency={senderWallet.currency()}
				isTotalAmount={transaction.recipients().length > 1}
				isSent={true}
			/>

			<TransactionFee currency={senderWallet.currency()} value={transaction.fee()} paddingPosition="top" />
		</TransactionSuccessful>
	);
};
