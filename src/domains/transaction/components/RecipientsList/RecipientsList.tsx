import React from "react";
import { RecipientItem, RecipientsProperties } from "./RecipientList.contracts";
import { Modal } from "@/app/components/Modal";
import { useTranslation } from "react-i18next";
import { RecipientsTable } from "@/domains/transaction/components/RecipientsList/RecipientsTable";
import { useBreakpoint } from "@/app/hooks";
import { InfoDetail, MultiEntryItem } from "@/app/components/MultiEntryItem/MultiEntryItem";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";

interface Properties {
	isOpen: boolean;
	onClose: () => void;
	recipients: RecipientItem[];
	ticker: string;
}

const ModalTitle = ({count}: {count: number}) => {
	const {t} = useTranslation();

	return (
		<span className="font-semibold leading-5">
			<span>{t("COMMON.RECIPIENTS")} </span>
			<span className="text-theme-secondary-500 dark:text-theme-secondary-500">
				({count}){" "}
			</span>
		</span>
	)
}

export const RecipientsList: React.FC<Properties> = ({isOpen, onClose, recipients, ticker}) => {
	const {isMdAndAbove} = useBreakpoint();

	return (
		<Modal
			isOpen={isOpen}
			size="3xl"
			title={<ModalTitle count={recipients.length}/>}
			onClose={onClose}
			noButtons
		>
			<div className="mt-4">
				{isMdAndAbove ? (
					<RecipientsTable recipients={recipients} ticker={ticker}/>
				) : (
					<Recipients recipients={recipients} ticker={ticker}/>
				)}
			</div>
		</Modal>
	);
};

const Recipients = ({recipients, ticker}: RecipientsProperties) => {
	const {t} = useTranslation();

	return (
		<>
			{recipients.map((recipient, index) => (
				<MultiEntryItem
					key={index}
					size="md"
					dataTestId="AddRecipientItem"
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
