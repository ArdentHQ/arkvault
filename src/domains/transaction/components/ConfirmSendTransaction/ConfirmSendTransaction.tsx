import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/Button";
import { FormButtons } from "@/app/components/Form";
import { Modal } from "@/app/components/Modal";
import { UnconfirmedTransactionTable } from "@/domains/transaction/components/TransactionTable/UnconfirmedTransactionTable/UnconfirmedTransactionTable";

interface ConfirmSendTransactionProperties {
	profile: Contracts.IProfile;
	isOpen: boolean;
	onClose?: any;
	onConfirm?: any;
	unconfirmedTransactions: DTO.ExtendedConfirmedTransactionData[];
}

export const ConfirmSendTransaction = ({
	profile,
	isOpen,
	onClose,
	onConfirm,
	unconfirmedTransactions,
}: ConfirmSendTransactionProperties) => {
	const { t } = useTranslation();

	return (
		<Modal title={t("TRANSACTION.MODAL_CONFIRM_SEND_TRANSACTION.TITLE")} isOpen={isOpen} onClose={onClose}>
			<div className="my-8 text-theme-secondary-text">
				{t("TRANSACTION.MODAL_CONFIRM_SEND_TRANSACTION.DESCRIPTION")}
			</div>

			<UnconfirmedTransactionTable transactions={unconfirmedTransactions} profile={profile} />

			<FormButtons>
				<Button variant="secondary" onClick={onClose} data-testid="ConfirmSendTransaction__cancel">
					{t("COMMON.BACK")}
				</Button>

				<Button type="submit" data-testid="ConfirmSendTransaction__confirm" onClick={onConfirm}>
					{t("COMMON.CONTINUE")}
				</Button>
			</FormButtons>
		</Modal>
	);
};
