import React from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "@/app/components/Alert";
import { FormButtons } from "@/app/components/Form";
import { Button } from "@/app/components/Button";
import { Image } from "@/app/components/Image";
import { FilePreview } from "@/domains/profile/components/FilePreview";
import { TransactionExportErrorProperties } from "@/domains/transaction/components/TransactionExportModal";

export const TransactionExportError = ({ error, file, onBack, onRetry }: TransactionExportErrorProperties) => {
	const { t } = useTranslation();

	return (
		<div>
			<Image name="ErrorBanner" className="mx-auto mb-6 hidden h-26 md:block" />

			<Alert className="mb-6" variant="danger">
				{error}
			</Alert>

			<FilePreview file={file} variant="danger" />

			<FormButtons>
				<Button variant="secondary" onClick={onBack} data-testid="TransactionExportError__back-button">
					{t("COMMON.BACK")}
				</Button>

				<Button variant="primary" data-testid="TransactionExportError__retry-button" onClick={onRetry}>
					{t("COMMON.RETRY")}
				</Button>
			</FormButtons>
		</div>
	);
};
