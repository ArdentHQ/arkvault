import React, { JSX } from "react";
import { useTranslation } from "react-i18next";

import { Alert } from "@/app/components/Alert";
import { Button } from "@/app/components/Button";
import { FormButtons } from "@/app/components/Form";
import { Icon } from "@/app/components/Icon";
import { Image } from "@/app/components/Image";
import { Modal } from "@/app/components/Modal";

interface DeleteResourceProperties extends JSX.IntrinsicAttributes {
	isOpen: boolean;
	disabled?: boolean;
	title: string;
	description?: string | React.ReactNode;
	children?: React.ReactNode;
	onClose?: any;
	onCancel?: any;
	onDelete: any;
	deleteLabel?: string;
}

export const DeleteResource = ({
	disabled = false,
	isOpen,
	title,
	description,
	children,
	onClose,
	onCancel,
	onDelete,
	deleteLabel,
	...attributes
}: DeleteResourceProperties) => {
	const { t } = useTranslation();

	return (
		<Modal
			title={title}
			image={<Image name="Trash" className="mx-auto my-8 max-w-52" />}
			size="2xl"
			isOpen={isOpen}
			onClose={onClose}
			{...attributes}
		>
			<Alert>{description}</Alert>

			{children || <div className="mt-4">{children}</div>}

			<FormButtons>
				<Button variant="secondary" onClick={onCancel} data-testid="DeleteResource__cancel-button">
					{t("COMMON.CANCEL")}
				</Button>

				<Button
					disabled={disabled}
					type="submit"
					onClick={onDelete}
					variant="danger"
					data-testid="DeleteResource__submit-button"
				>
					<Icon name="Trash" />
					<span>{deleteLabel ?? t("COMMON.DELETE")}</span>
				</Button>
			</FormButtons>
		</Modal>
	);
};
