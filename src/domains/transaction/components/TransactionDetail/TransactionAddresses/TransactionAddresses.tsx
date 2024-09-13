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
	labelClassName?: string
}

export const TransactionAddresses = ({ senderWallet, recipients = [], profile, labelClassName }: Properties): ReactElement => {
	const { t } = useTranslation();
	const { getWalletAlias } = useWalletAlias();

	const { alias } = getWalletAlias({
		address: senderWallet.address(),
		network: senderWallet.network(),
		profile,
	});

	return (
		<DetailWrapper label={t("TRANSACTION.ADDRESSING")}>
			<div className="flex w-full items-center justify-between gap-4 space-x-2 sm:justify-start sm:space-x-0">
				<DetailLabelText className={labelClassName}>{t("COMMON.FROM")}</DetailLabelText>
				<Address
					address={senderWallet.address()}
					walletName={alias}
					showCopyButton
					walletNameClass="text-theme-text text-sm leading-[17px] sm:leading-5 sm:text-base"
					addressClass="text-theme-secondary-500 dark:text-theme-secondary-700 text-sm leading-[17px] sm:leading-5 sm:text-base"
					wrapperClass="justify-end sm:justify-start"
				/>
			</div>

			{recipients.length > 0 && (
				<div className="hidden h-8 w-full items-center sm:flex">
					<Divider dashed />
				</div>
			)}

			{recipients.map((recipient, index) => (
				<div className="mt-3 sm:mt-0 flex w-full items-center justify-between gap-4 space-x-2 sm:justify-start sm:space-x-0" key={index}>
					<DetailLabelText className={labelClassName}>{t("COMMON.TO")}</DetailLabelText>
					<Address
						key={index}
						address={recipient.address}
						walletName={recipient.alias}
						showCopyButton
						walletNameClass="text-theme-text text-sm leading-[17px] sm:leading-5 sm:text-base"
						addressClass="text-theme-secondary-500 dark:text-theme-secondary-700 text-sm leading-[17px] sm:leading-5 sm:text-base"
						wrapperClass="justify-end sm:justify-start"
					/>
				</div>
			))}
		</DetailWrapper>
	);
};
