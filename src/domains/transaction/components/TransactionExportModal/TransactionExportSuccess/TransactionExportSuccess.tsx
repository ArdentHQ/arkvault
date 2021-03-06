import React from "react";
import { useTranslation } from "react-i18next";
import { useFileDownload } from "./hooks/use-file-download";
import { Alert } from "@/app/components/Alert";
import { FormButtons } from "@/app/components/Form";
import { Button } from "@/app/components/Button";
import { Image } from "@/app/components/Image";
import { FilePreview } from "@/domains/profile/components/FilePreview";
import { TransactionExportStatusProperties } from "@/domains/transaction/components/TransactionExportModal";

export const TransactionExportSuccess = ({ count, file, onCancel, onDownload }: TransactionExportStatusProperties) => {
	const { t } = useTranslation();

	const { download } = useFileDownload();

	const renderAlert = () => {
		if (count === 0) {
			return (
				<Alert className="my-6" variant="warning">
					{t("TRANSACTION.EXPORT.EMPTY.DESCRIPTION")}
				</Alert>
			);
		}

		return (
			<Alert className="my-6" variant="success">
				{t("TRANSACTION.EXPORT.SUCCESS.DESCRIPTION")}
			</Alert>
		);
	};

	return (
		<div>
			<Image
				name={count === 0 ? "Warning" : "Success"}
				useAccentColor={count !== undefined && count > 0}
				className="my-6 mx-auto hidden h-32 w-full md:block"
			/>

			{renderAlert()}

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
					disabled={count === 0}
					type="submit"
					variant="primary"
					data-testid="TransactionExportSuccess__download-button"
					onClick={async () => {
						const filename = await download(file);

						if (filename) {
							onDownload?.(filename);
						}
					}}
				>
					{t("COMMON.DOWNLOAD")}
				</Button>
			</FormButtons>
		</div>
	);
};
