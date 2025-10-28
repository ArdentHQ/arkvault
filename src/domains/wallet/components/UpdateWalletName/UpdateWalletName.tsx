import React from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/app/components/Modal";
import { UpdateWalletNameForm, UpdateWalletNameProperties } from "./UpdateWalletNameForm";

export const UpdateWalletName = ({ onAfterSave, onCancel, profile, wallet }: UpdateWalletNameProperties) => {
	const { t } = useTranslation();

	return (
		<Modal
			isOpen
			title={t("WALLETS.MODAL_NAME_WALLET.TITLE")}
			description={t("WALLETS.MODAL_NAME_WALLET.DESCRIPTION")}
			size="2xl"
			containerClassName="mt-[20%] md:mt-0"
			onClose={onCancel}
		>
			<UpdateWalletNameForm onAfterSave={onAfterSave} onCancel={onCancel} profile={profile} wallet={wallet} />
		</Modal>
	);
};
