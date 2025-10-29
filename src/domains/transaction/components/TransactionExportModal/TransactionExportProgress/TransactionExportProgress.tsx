import { Alert } from "@/app/components/Alert";
import { Button } from "@/app/components/Button";
import { FilePreview } from "@/domains/profile/components/FilePreview";
import { FormButtons } from "@/app/components/Form";
import { Image } from "@/app/components/Image";
import React from "react";
import { TransactionExportProgressProperties } from "@/domains/transaction/components/TransactionExportModal";
import { formatNumber } from "@/app/lib/helpers";
import { useTranslation } from "react-i18next";

export const TransactionExportProgress = ({ count, file, onCancel }: TransactionExportProgressProperties) => {
	const { t } = useTranslation();

	const renderAlert = () => {
		if (count === 0) {
			return (
				<Alert className="mb-6" variant="info">
					{t("TRANSACTION.EXPORT.PROGRESS.DESCRIPTION_START")}
				</Alert>
			);
		}

		return (
			<Alert className="mb-6" variant="info">
				{t("TRANSACTION.EXPORT.PROGRESS.DESCRIPTION", { count: formatNumber(count) as never })}
			</Alert>
		);
	};

	return (
		<div>
			<Image name="Info" className="mx-auto mb-6 hidden h-26 md:block" />

			{renderAlert()}

			<FilePreview file={file} variant="loading" />

			<div className="mt-4 modal-footer">
			<FormButtons>
				<Button variant="secondary" onClick={onCancel} data-testid="TransactionExportProgress__cancel-button">
					{t("COMMON.CANCEL")}
				</Button>

				<Button variant="primary" disabled>
					{t("COMMON.DOWNLOAD")}
				</Button>
			</FormButtons>
			</div>
		</div>
	);
};
