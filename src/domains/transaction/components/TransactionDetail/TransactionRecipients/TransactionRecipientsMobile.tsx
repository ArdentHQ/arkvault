import React from "react";
import { useTranslation } from "react-i18next";

import { Address } from "@/app/components/Address";
import { Avatar } from "@/app/components/Avatar";
import { TransactionRecipientsProperties } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { TransactionDetail } from "@/domains/transaction/components/TransactionDetail/TransactionDetail";
import { RowWrapper, RowLabel } from "@/app/components/Table/Mobile/Row";
import { Amount } from "@/app/components/Amount";

export const TransactionRecipientsMobile: React.FC<TransactionRecipientsProperties> = ({
	currency,
	recipients,
	showAmount,
	label,
	...properties
}: TransactionRecipientsProperties) => {
	const { t } = useTranslation();
	return (
		<>
			{label && (
				<RowLabel>
					<div className="my-2 whitespace-nowrap">{label}</div>
				</RowLabel>
			)}

			{recipients.map((recipient, key: number) => (
				<TransactionDetail data-testid="TransactionRecipient" borderPosition="bottom" key={key} {...properties}>
					<div className="flex-col space-y-4 w-full">
						<RowWrapper>
							<RowLabel>
								<div className="whitespace-nowrap">{`#${key + 1}`}</div>
							</RowLabel>
							<div className="flex items-center space-x-2 w-full text-right">
								<div className="overflow-auto flex-1 w-0 text-right md:text-left">
									<Address
										address={recipient.address}
										walletName={recipient.alias}
										walletNameClass="text-theme-text"
										alignment="right"
									/>
								</div>
								<Avatar size="xs" address={recipient.address} noShadow />
							</div>
						</RowWrapper>

						{showAmount && (
							<RowWrapper>
								<RowLabel>{t("COMMON.AMOUNT")}</RowLabel>
								<div className="text-theme-secondary-700 dark:text-theme-secondary-500">
									<Amount value={recipient.amount as number} ticker={currency} />
								</div>
							</RowWrapper>
						)}
					</div>
				</TransactionDetail>
			))}
		</>
	);
};
