import React from "react";
import { useTranslation } from "react-i18next";

import { WalletEncryptionWarningProperties } from "./WalletEncryptionWarning.contracts";
import { Button } from "@/app/components/Button";
import { Image } from "@/app/components/Image";
import { Modal } from "@/app/components/Modal";
import { FormButtons } from "@/app/components/Form";
import { Alert } from "@/app/components/Alert";

export const WalletEncryptionWarning: React.FC<WalletEncryptionWarningProperties> = ({
	importType,
	onCancel,
	onConfirm,
}) => {
	const { t } = useTranslation();

	return (
		<Modal
			title={t("WALLETS.MODAL_WALLET_ENCRYPTION.TITLE")}
			image={<Image name="Warning" useAccentColor={false} className="my-8 mx-auto max-w-52" />}
			size="lg"
			isOpen
			onClose={onCancel}
		>
			<Alert>{t("WALLETS.MODAL_WALLET_ENCRYPTION.DESCRIPTION", { importType })}</Alert>

			<FormButtons>
				<Button variant="secondary" onClick={onCancel} data-testid="WalletEncryptionWarning__cancel-button">
					{t("COMMON.CANCEL")}
				</Button>

				<Button
					type="submit"
					onClick={onConfirm}
					variant="primary"
					data-testid="WalletEncryptionWarning__submit-button"
				>
					{t("COMMON.CONTINUE")}
				</Button>
			</FormButtons>
		</Modal>
	);
};
