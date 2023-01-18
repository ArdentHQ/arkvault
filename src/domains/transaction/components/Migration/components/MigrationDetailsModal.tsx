import React from "react";

import { DTO } from "@ardenthq/sdk-profiles";
import { useTranslation } from "react-i18next";
import { Modal } from "@/app/components/Modal";
import { FormButtons } from "@/app/components/Form";
import { Button } from "@/app/components/Button";

export interface MigrationDetailsModalProperties {
	transaction?: DTO.ExtendedConfirmedTransactionData;
	onClose: () => void;
}

export const MigrationDetailsModal = ({ transaction, onClose }: MigrationDetailsModalProperties) => {
	const { t } = useTranslation();

	return (
		<Modal title={"MOdal title"} size="md" isOpen={transaction !== undefined} onClose={onClose}>
			<div data-testid="ConfirmationModal">
				<FormButtons>
					<Button variant="secondary" onClick={onClose} data-testid="ConfirmationModal__no-button">
						{t("COMMON.NO")}
					</Button>

					<Button
						type="button"
						onClick={onClose}
						variant="primary"
						data-testid="ConfirmationModal__yes-button"
					>
						<span>{t("COMMON.YES")}</span>
					</Button>
				</FormButtons>
			</div>
		</Modal>
	);
};
