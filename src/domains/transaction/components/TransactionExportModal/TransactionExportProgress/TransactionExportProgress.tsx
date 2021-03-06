import React from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "@/app/components/Alert";
import { FormButtons } from "@/app/components/Form";
import { Button } from "@/app/components/Button";
import { Image } from "@/app/components/Image";
import { FilePreview } from "@/domains/profile/components/FilePreview";
import { TransactionExportStatusProperties } from "@/domains/transaction/components/TransactionExportModal";

export const TransactionExportProgress = ({ onCancel, file }: TransactionExportStatusProperties) => {
	const { t } = useTranslation();

	return (
		<div>
			<Image name="Info" className="my-6 mx-auto hidden h-32 w-2/5 md:block" />

			<Alert className="my-6" variant="info">
				{t("TRANSACTION.EXPORT.PROGRESS.DESCRIPTION")}
			</Alert>

			<FilePreview file={file} variant="loading" />

			<FormButtons>
				<Button
					variant="secondary"
					onClick={() => onCancel?.()}
					data-testid="TransactionExportProgress__cancel-button"
				>
					{t("COMMON.CANCEL")}
				</Button>

				<Button variant="primary" disabled>
					{t("COMMON.DOWNLOAD")}
				</Button>
			</FormButtons>
		</div>
	);
};
