import { Alert } from "@/app/components/Alert";
import { FilePreview } from "@/domains/profile/components/FilePreview";
import React, { JSX } from "react";
import { TransactionExportStatusProperties } from "@/domains/transaction/components/TransactionExportSidePanel";
import { formatNumber } from "@/app/lib/helpers";
import { useTranslation } from "react-i18next";

export const TransactionExportProgress = ({ count, file }: TransactionExportStatusProperties): JSX.Element => {
	const { t } = useTranslation();

	return (
		<div data-testid="TransactionExportProgress" className="space-y-4">
			<Alert variant="info">
				{count === 0
					? t("TRANSACTION.EXPORT.PROGRESS.DESCRIPTION_START")
					: t("TRANSACTION.EXPORT.PROGRESS.DESCRIPTION", { count: formatNumber(count) as never })}
			</Alert>

			<FilePreview file={file} variant="loading" />
		</div>
	);
};
