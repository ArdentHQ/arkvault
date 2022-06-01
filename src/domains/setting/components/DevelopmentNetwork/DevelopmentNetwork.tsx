import React from "react";
import { useTranslation } from "react-i18next";

import { DevelopmentNetworkProperties } from "./DevelopmentNetwork.contracts";
import { Button } from "@/app/components/Button";
import { Modal } from "@/app/components/Modal";
import { FormButtons } from "@/app/components/Form";

export const DevelopmentNetwork: React.FC<DevelopmentNetworkProperties> = ({
	isOpen,
	onClose,
	onCancel,
	onContinue,
}) => {
	const { t } = useTranslation();

	return (
		<Modal
			title={t("SETTINGS.MODAL_DEVELOPMENT_NETWORK.TITLE")}
			description={t("SETTINGS.MODAL_DEVELOPMENT_NETWORK.DESCRIPTION")}
			size="xl"
			isOpen={isOpen}
			onClose={onClose}
		>
			<FormButtons>
				<Button variant="secondary" onClick={onCancel} data-testid="DevelopmentNetwork__cancel-button">
					{t("COMMON.CANCEL")}
				</Button>

				<Button onClick={onContinue} data-testid="DevelopmentNetwork__continue-button">
					{t("COMMON.CONTINUE")}
				</Button>
			</FormButtons>
		</Modal>
	);
};
