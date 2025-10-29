import React from "react";
import { Trans, useTranslation } from "react-i18next";

import { Button } from "@/app/components/Button";
import { FormButtons } from "@/app/components/Form";
import { Image } from "@/app/components/Image";
import { Modal } from "@/app/components/Modal";
import { Alert } from "@/app/components/Alert";

interface Properties {
	isOpen: boolean;
	onCancel: () => void;
	onConfirm: () => void;
	migratedWalletsCount?: number
}

export const StopMigrationConfirmationModal = ({ isOpen, onCancel, onConfirm, migratedWalletsCount }: Properties) => {
	const { t } = useTranslation();

	return (
		<Modal
			title={t("COMMON.LEDGER_MIGRATION.EXIT_MODAL.TITLE")}
			titleClass="text-theme-text"
			image={<Image name="Trash" className="mx-auto mt-4 mb-6 max-w-52" />}
			size="2xl"
			isOpen={isOpen}
			onClose={onCancel}
		>
			<Alert variant="warning" className="mb-6">
				<Trans i18nKey="COMMON.LEDGER_MIGRATION.EXIT_MODAL.BODY" count={migratedWalletsCount} />
			</Alert>

			<div className="border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 modal-footer -mx-6 px-6 sm:border-t">
				<FormButtons>
					<Button variant="secondary" onClick={onCancel} data-testid="ConfirmationModal__no-button">
						{t("COMMON.NO")}
					</Button>

					<Button
						type="button"
						onClick={onConfirm}
						variant="primary"
						data-testid="ConfirmationModal__yes-button"
					>
						<span>{t("COMMON.LEDGER_MIGRATION.EXIT_MODAL.STOP_MIGRATION")}</span>
					</Button>
				</FormButtons>
			</div>
		</Modal>
	);
};
