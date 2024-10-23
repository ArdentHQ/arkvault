import React from "react";
import { Modal } from "@/app/components/Modal";
import { useTranslation } from "react-i18next";
import { useBreakpoint } from "@/app/hooks";
import { RecipientsTable } from "@/domains/transaction/components/RecipientsModal/RecipientsTable";
import { RecipientsList } from "@/domains/transaction/components/RecipientsModal/RecipientsList";
import { RecipientItem } from "@/domains/transaction/components/RecipientsModal/RecipientsModal.contracts";

interface Properties {
	isOpen: boolean;
	onClose: () => void;
	recipients: RecipientItem[];
	ticker: string;
}

const ModalTitle = ({ count }: { count: number }) => {
	const { t } = useTranslation();

	return (
		<span className="font-semibold leading-5 inline-flex items-center gap-1">
			<span>{t("COMMON.RECIPIENTS")} </span>
			<span
				className="text-theme-secondary-500 dark:text-theme-secondary-500"
				data-testid="RecipientsModal--RecipientsCount"
			>
				({count})
			</span>
		</span>
	);
};

export const RecipientsModal: React.FC<Properties> = ({ isOpen, onClose, recipients, ticker }) => {
	const { isMdAndAbove } = useBreakpoint();

	return (
		<Modal
			isOpen={isOpen}
			size="3xl"
			title={<ModalTitle count={recipients.length} />}
			onClose={onClose}
			noButtons
			data-testid="RecipientsModal"
		>
			<div className="mt-2.5 md:mt-[18px]">
				{isMdAndAbove ? (
					<RecipientsTable recipients={recipients} ticker={ticker} />
				) : (
					<RecipientsList recipients={recipients} ticker={ticker} />
				)}
			</div>
		</Modal>
	);
};
