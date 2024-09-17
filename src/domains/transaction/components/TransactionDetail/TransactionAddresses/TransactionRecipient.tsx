import React from "react";
import { Address } from "@/app/components/Address";
import { DetailTitle } from "@/app/components/DetailWrapper";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { useTranslation } from "react-i18next";
import { Divider } from "@/app/components/Divider";

export const TransactionRecipient = ({ recipient, showLabel, labelClassName }: { labelClassName?: string; showLabel: boolean; recipient: RecipientItem }) => {
	const { t } = useTranslation();

	return (
		<>
			<div className="hidden h-8 w-full items-center sm:flex">
				<Divider dashed />
			</div>

			<div className="mt-3 flex w-full items-center justify-between gap-4 space-x-2 sm:mt-0 sm:justify-start sm:space-x-0">
				{showLabel && <DetailTitle className={labelClassName}>{t("COMMON.TO")}</DetailTitle>}
				<Address
					address={recipient.address}
					walletName={recipient.alias}
					showCopyButton
					walletNameClass="text-theme-text text-sm leading-[17px] sm:leading-5 sm:text-base"
					addressClass="text-theme-secondary-500 dark:text-theme-secondary-700 text-sm leading-[17px] sm:leading-5 sm:text-base"
					wrapperClass="justify-end sm:justify-start"
				/>
			</div>
		</>
	)
}
