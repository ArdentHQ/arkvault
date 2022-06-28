import React from "react";
import { useTranslation } from "react-i18next";
import { useFileDownload } from "./hooks/use-file-download";
import { Alert } from "@/app/components/Alert";
import { FormButtons } from "@/app/components/Form";
import { Button } from "@/app/components/Button";
import { Image } from "@/app/components/Image";
import { FilePreview } from "@/domains/profile/components/FilePreview";
import { TransactionExportStatusProperties } from "@/domains/transaction/components/TransactionExportModal";

export const TransactionExportSuccess = ({ onCancel, onDownload, file }: TransactionExportStatusProperties) => {
	const { t } = useTranslation();

	const { download } = useFileDownload();

	return (
		<div>
			<Image name="Success" className="my-6 mx-auto hidden h-32 w-full md:block" />

			<Alert className="my-6" variant="success">
				{t("TRANSACTION.EXPORT.SUCCESS.DESCRIPTION")}
			</Alert>

			<FilePreview file={file} variant="success" />

			<FormButtons>
				<Button
					variant="secondary"
					onClick={() => onCancel?.()}
					data-testid="TransactionExportSuccess__close-button"
				>
					{t("COMMON.CANCEL")}
				</Button>

				<Button
					type="submit"
					variant="primary"
					data-testid="TransactionExportSuccess__download-button"
					onClick={async () => {
						if (await download(file)) {
							onDownload?.();
						}
					}}
				>
					{t("COMMON.DOWNLOAD")}
				</Button>
			</FormButtons>
		</div>
	);
};
