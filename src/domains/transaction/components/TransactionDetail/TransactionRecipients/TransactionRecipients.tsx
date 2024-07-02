import cn from "classnames";
import React from "react";
import { useTranslation } from "react-i18next";

import { Address } from "@/app/components/Address";
import { Avatar } from "@/app/components/Avatar";
import { useBreakpoint } from "@/app/hooks";
import { RecipientList } from "@/domains/transaction/components/RecipientList";
import { TransactionRecipientsProperties } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { TransactionDetail } from "@/domains/transaction/components/TransactionDetail/TransactionDetail";
import { TransactionDelegateIcon } from "@/domains/transaction/components/TransactionDetail/TransactionResponsiveIcon/TransactionResponsiveIcon";

import { TransactionRecipientsMobile } from "./TransactionRecipientsMobile";

export const TransactionRecipients: React.FC<TransactionRecipientsProperties> = ({
	currency,
	recipients,
	showAmount,
	label,
	...properties
}: TransactionRecipientsProperties) => {
	const { t } = useTranslation();
	const { isSm, isXs } = useBreakpoint();

	if (recipients.length === 0) {
		return <></>;
	}

	if (recipients.length === 1) {
		const { address, alias, isDelegate } = recipients[0];

		const iconSize = isSm || isXs ? "xs" : "lg";
		const iconSpaceClass = isSm || isXs ? "space-x-2" : "-space-x-1";

		return (
			<TransactionDetail
				data-testid="TransactionRecipients"
				label={t("TRANSACTION.RECIPIENT")}
				extra={
					<div className={cn("flex items-center", iconSpaceClass)}>
						{isDelegate && <TransactionDelegateIcon />}
						<Avatar address={address} size={iconSize} />
					</div>
				}
				{...properties}
			>
				<div className="w-0 flex-1 text-right md:text-left">
					<Address
						address={address}
						alignment={isXs || isSm ? "right" : undefined}
						walletName={alias}
						walletNameClass="flex-1 md:flex-none text-theme-text"
					/>
				</div>
			</TransactionDetail>
		);
	}

	if (isXs || isSm) {
		return (
			<TransactionRecipientsMobile
				recipients={recipients}
				label={label}
				currency={currency}
				{...properties}
				showAmount={showAmount}
			/>
		);
	}

	return (
		<TransactionDetail data-testid="TransactionRecipients" label={label} {...properties}>
			<RecipientList
				isEditable={false}
				recipients={recipients}
				showAmount
				showExchangeAmount={false}
				ticker={currency}
				variant="condensed"
			/>
		</TransactionDetail>
	);
};
