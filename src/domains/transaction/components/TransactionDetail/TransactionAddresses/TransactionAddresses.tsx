import React, { ReactElement } from "react";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { useTranslation } from "react-i18next";
import { Contracts } from "@ardenthq/sdk-profiles";
import { Networks } from "@ardenthq/sdk";
import { Address } from "@/app/components/Address";
import { useWalletAlias } from "@/app/hooks";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { TransactionRecipients, TransactionRecipientsModal } from "./TransactionRecipient";
import cn from "classnames";

interface Properties {
	senderAddress: string;
	recipients?: RecipientItem[];
	profile: Contracts.IProfile;
	labelClassName?: string;
	network: Networks.Network;
	explorerLink?: string;
}

export const TransactionAddresses = ({
	recipients = [],
	profile,
	senderAddress,
	network,
	labelClassName,
	explorerLink,
}: Properties): ReactElement => {
	const { t } = useTranslation();
	const { getWalletAlias } = useWalletAlias();

	const { alias } = getWalletAlias({
		address: senderAddress,
		network: network,
		profile,
	});

	return (
		<DetailWrapper label={t("TRANSACTION.ADDRESSING")}>
			<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
				<DetailTitle className={labelClassName}>{t("COMMON.FROM")}</DetailTitle>
				<Address
					truncateOnTable
					address={senderAddress}
					walletName={alias}
					showCopyButton
					walletNameClass="text-theme-text text-sm leading-[17px] sm:leading-5 sm:text-base"
					wrapperClass="justify-end sm:justify-start"
					addressClass={cn("text-sm leading-[17px] sm:leading-5 sm:text-base w-full w-3/4", {
						"text-theme-secondary-500 dark:text-theme-secondary-700 ": !!alias,
					})}
				/>
			</div>

			{explorerLink && (
				<TransactionRecipients
					labelClassName={labelClassName}
					recipients={recipients}
					explorerLink={explorerLink}
				/>
			)}

			{!explorerLink && (
				<TransactionRecipientsModal
					recipients={recipients}
					ticker={network.ticker()}
					labelClassName={labelClassName}
				/>
			)}
		</DetailWrapper>
	);
};
