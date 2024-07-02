import { formatNumber } from "@ardenthq/sdk-helpers";
import React from "react";
import { useTranslation } from "react-i18next";

import { Alert } from "@/app/components/Alert";
import { Button } from "@/app/components/Button";
import { FormButtons } from "@/app/components/Form";
import { Image } from "@/app/components/Image";
import { FilePreview } from "@/domains/profile/components/FilePreview";
import { TransactionExportProgressProperties } from "@/domains/transaction/components/TransactionExportModal";

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
