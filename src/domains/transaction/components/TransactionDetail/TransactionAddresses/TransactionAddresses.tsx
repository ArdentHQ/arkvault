import React, { ReactElement } from "react";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { useTranslation } from "react-i18next";
import { Contracts } from "@ardenthq/sdk-profiles";
import { Networks } from "@ardenthq/sdk";
import { Address } from "@/app/components/Address";
import { useWalletAlias } from "@/app/hooks";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { TransactionRecipients, TransactionRecipient } from "./TransactionRecipient";

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
			<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0 ">
				<DetailTitle className={labelClassName}>{t("COMMON.FROM")}</DetailTitle>
				<Address
					truncateOnTable
					address={senderAddress}
					walletName={alias}
					showCopyButton
					walletNameClass="text-theme-text text-sm sm:leading-5 sm:text-base"
					addressClass="text-theme-secondary-500 dark:text-theme-secondary-700 text-sm sm:text-base w-full w-3/4"
					wrapperClass="justify-end sm:justify-start"
				/>
			</div>

			{explorerLink && (
				<TransactionRecipients
					labelClassName={labelClassName}
					recipients={recipients}
					explorerLink={explorerLink}
				/>
			)}

			{!explorerLink &&
				recipients.map((recipient, index) => (
					<TransactionRecipient
						recipient={recipient}
						labelClassName={labelClassName}
						key={index}
						showLabel={index === 0}
					/>
				))}
		</DetailWrapper>
	);
};
