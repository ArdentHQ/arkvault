import React from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "@/app/components/Alert";
import { FormButtons } from "@/app/components/Form";
import { Button } from "@/app/components/Button";
import { Image } from "@/app/components/Image";
import { FilePreview } from "@/domains/profile/components/FilePreview";
import { TransactionExportProgressProperties } from "@/domains/transaction/components/TransactionExportModal";

export const TransactionExportProgress = ({ file, onCancel }: TransactionExportProgressProperties) => {
	const { t } = useTranslation();

	return (
		<div>
			<Image name="Info" className="mx-auto mb-6 hidden h-26 md:block" />

			<Alert className="mb-6" variant="info">
				{t("TRANSACTION.EXPORT.PROGRESS.DESCRIPTION")}
			</Alert>

			<FilePreview file={file} variant="loading" />

			<FormButtons>
				<Button variant="secondary" onClick={onCancel} data-testid="TransactionExportProgress__cancel-button">
					{t("COMMON.CANCEL")}
				</Button>

				<Button variant="primary" disabled>
					{t("COMMON.DOWNLOAD")}
				</Button>
			</FormButtons>
		</div>
	);
};
