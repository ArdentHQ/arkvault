import React, { ReactElement } from "react";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { useTranslation } from "react-i18next";
import { Contracts } from "@ardenthq/sdk-profiles";
import { Address } from "@/app/components/Address";
import { useWalletAlias } from "@/app/hooks";
import { Divider } from "@/app/components/Divider";
import { TransactionReviewLabelText, TransactionReviewDetail, TransactionReviewDetailLabel } from "@/domains/transaction/components/TransactionReviewDetail";

interface Properties {
	senderWallet: Contracts.IReadWriteWallet;
	recipients: RecipientItem[];
	profile: Contracts.IProfile;
}

export const TransactionAddresses = ({
	senderWallet,
	recipients,
	profile,
}: Properties): ReactElement => {
	const { t } = useTranslation();
	const { getWalletAlias } = useWalletAlias()

	const { alias } = getWalletAlias({
		address: senderWallet.address(),
		network: senderWallet.network(),
		profile,
	})

	return (
		<TransactionReviewDetail
			label={t("TRANSACTION.ADDRESSING")}
			data-testid="TransactionAddresses"
			labelMinWidth="sm"
		>

			<div className="w-full flex">
				<TransactionReviewLabelText minWidth="sm">{t("COMMON.FROM")}</TransactionReviewLabelText>
				<Address
					address={senderWallet.address()}
					walletName={alias}
					walletNameClass="text-theme-text"
					showCopyButton
				/>
			</div>

			<div className="h-8 items-center w-full hidden sm:flex">
				<Divider dashed />
			</div>

			{recipients.map((recipient, index) =>
				<div className="w-full flex mt-3 sm:mt-0" key={index}>
					<TransactionReviewLabelText minWidth="sm">{t("COMMON.TO")}</TransactionReviewLabelText>
					<Address
						key={index}
						address={recipient.address}
						walletName={recipient.alias}
						walletNameClass="text-theme-text"
						showCopyButton
					/>
				</div>
			)}
		</TransactionReviewDetail>
	);
}
