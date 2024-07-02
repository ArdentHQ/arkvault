import { formatNumber } from "@ardenthq/sdk-helpers";
import React from "react";
import { useTranslation } from "react-i18next";

import { Alert } from "@/app/components/Alert";
import { Button } from "@/app/components/Button";
import { FormButtons } from "@/app/components/Form";
import { Image } from "@/app/components/Image";
import { FilePreview } from "@/domains/profile/components/FilePreview";
import { TransactionExportStatusProperties } from "@/domains/transaction/components/TransactionExportModal";

import { useFileDownload } from "./hooks/use-file-download";

export const TransactionExportSuccess = ({ count, file, onBack, onDownload }: TransactionExportStatusProperties) => {
	const { t } = useTranslation();

	const { download } = useFileDownload();

	const renderAlert = () => {
		if (count === 0) {
			return (
				<Alert className="mb-6" variant="warning">
					{t("TRANSACTION.EXPORT.EMPTY.DESCRIPTION")}
				</Alert>
			);
		}

		return (
			<Alert className="mb-6" variant="success">
				{t("TRANSACTION.EXPORT.SUCCESS.DESCRIPTION", { count: formatNumber(count) as never })}
			</Alert>
		);
	};

	return (
		<div>
			<Image
				name={count === 0 ? "Warning" : "Success"}
				useAccentColor={count !== undefined && count > 0}
				className="mx-auto mb-6 hidden h-26 md:block"
			/>

			{renderAlert()}

			<FilePreview file={file} variant="success" />

			<FormButtons>
				<Button variant="secondary" onClick={onBack} data-testid="TransactionExportSuccess__back-button">
					{t("COMMON.BACK")}
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
