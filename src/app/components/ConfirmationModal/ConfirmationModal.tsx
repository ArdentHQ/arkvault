import React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/Button";
import { FormButtons } from "@/app/components/Form";
import { Image } from "@/app/components/Image";
import { Modal } from "@/app/components/Modal";
import { Size } from "@/types";

interface Properties {
	isOpen: boolean;
	description?: string;
	title?: string;
	onCancel?: () => void;
	onConfirm?: () => void;
	size?: Size;
}

export const ConfirmationModal = ({ description, title, size = "lg", isOpen, onCancel, onConfirm }: Properties) => {
	const { t } = useTranslation();

	return (
		<Modal
			title={title || t("COMMON.CONFIRMATION_MODAL.TITLE")}
			titleClass="text-theme-text"
			image={<Image name="GenericWarning" className="m-auto my-8 w-3/5" />}
			description={description || t("COMMON.CONFIRMATION_MODAL.DESCRIPTION")}
			size={size}
			isOpen={isOpen}
			onClose={onCancel}
		>
			<div data-testid="ConfirmationModal" className="modal-footer">
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
						<span>{t("COMMON.YES")}</span>
					</Button>
				</FormButtons>
			</div>
		</Modal>
	);
};
