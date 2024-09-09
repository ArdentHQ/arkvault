import React, { ReactElement } from "react";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { useTranslation } from "react-i18next";
import { Contracts } from "@ardenthq/sdk-profiles";
import { Address } from "@/app/components/Address";
import { useWalletAlias } from "@/app/hooks";
import { Divider } from "@/app/components/Divider";
import { DetailLabelText, DetailWrapper } from "@/app/components/DetailWrapper";

interface Properties {
	senderWallet: Contracts.IReadWriteWallet;
	recipients: RecipientItem[];
	profile: Contracts.IProfile;
}

export const TransactionAddresses = ({ senderWallet, recipients = [], profile }: Properties): ReactElement => {
	const { t } = useTranslation();
	const { getWalletAlias } = useWalletAlias();

	const { alias } = getWalletAlias({
		address: senderWallet.address(),
		network: senderWallet.network(),
		profile,
	});

	return (
		<DetailWrapper label={t("TRANSACTION.ADDRESSING")}>
			<div className="flex w-full">
				<DetailLabelText minWidth="md">{t("COMMON.FROM")}</DetailLabelText>
				<Address
					address={senderWallet.address()}
					walletName={alias}
					walletNameClass="text-theme-text"
					showCopyButton
					wrapperClass="md:w-3/4"
				/>
			</div>

			{recipients.length > 0 && (
				<div className="hidden h-8 w-full items-center md:flex">
					<Divider dashed />
				</div>
			)}

			{recipients.map((recipient, index) => (
				<div className="mt-3 flex w-full md:mt-0" key={index}>
					<DetailLabelText minWidth="md">{t("COMMON.TO")}</DetailLabelText>
					<Address
						key={index}
						address={recipient.address}
						walletName={recipient.alias}
						walletNameClass="text-theme-text"
						showCopyButton
						wrapperClass="sm:w-3/4"
					/>
				</div>
			))}
		</DetailWrapper>
	);
};
