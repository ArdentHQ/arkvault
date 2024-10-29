import { useTranslation } from "react-i18next";
import { InfoDetail, MultiEntryItem } from "@/app/components/MultiEntryItem/MultiEntryItem";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import React from "react";
import { RecipientsProperties } from "@/domains/transaction/components/RecipientsModal/RecipientsModal.contracts";

export const RecipientsList = ({ recipients, ticker }: RecipientsProperties): JSX.Element => {
	const { t } = useTranslation();

	return (
		<>
			{recipients.map((recipient, index) => (
				<MultiEntryItem
					key={index}
					size="md"
					dataTestId="RecipientsListItem"
					titleSlot={
						<div className="flex w-full items-center justify-between">
							<div className="whitespace-nowrap text-sm font-semibold leading-[17px] text-theme-secondary-700 dark:text-theme-secondary-500">
								{t("COMMON.RECIPIENT_#", { count: index + 1 })}
							</div>
						</div>
					}
					bodySlot={
						<div className="space-y-4">
							<InfoDetail
								label="Address"
								body={
									<Address
										address={recipient.address}
										walletName={recipient.alias}
										showCopyButton
										walletNameClass="leading-[17px] text-sm"
										addressClass="leading-[17px] text-sm text-theme-secondary-500 dark:text-theme-secondary-700"
									/>
								}
							/>
							<InfoDetail
								label="Value"
								body={
									<Amount
										ticker={ticker}
										value={recipient.amount as number}
										className="text-sm font-semibold leading-[17px] text-theme-secondary-900 dark:text-theme-secondary-200"
									/>
								}
							/>
						</div>
					}
				/>
			))}
		</>
	);
};
