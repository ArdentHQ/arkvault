import React from "react";
import { Modal } from "@/app/components/Modal";
import { useTranslation } from "react-i18next";
import { UpdateAccountNameForm, UpdateWalletNameProperties } from "./UpdateAccountNameForm";

export const UpdateAccountNameModal = ({ onAfterSave, onCancel, profile, wallet }: UpdateWalletNameProperties) => {
	const { t } = useTranslation();

	return (
		<Modal
			isOpen
			title={t("COMMON.ACCOUNT_NAME")}
			description={t("WALLETS.MODAL_NAME_WALLET.HD_DESCRIPTION")}
			size="2xl"
			containerClassName="mt-[20%] md:mt-0"
			onClose={onCancel}
		>
			<UpdateAccountNameForm onAfterSave={onAfterSave} onCancel={onCancel} profile={profile} wallet={wallet} />
		</Modal>
	);
};
