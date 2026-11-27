import { Alert } from "@/app/components/Alert";
import { FilePreview } from "@/domains/profile/components/FilePreview";
import React, { JSX } from "react";
import { TransactionExportStatusProperties } from "@/domains/transaction/components/TransactionExportSidePanel";
import { formatNumber } from "@/app/lib/helpers";
import { useTranslation } from "react-i18next";

export const TransactionExportSuccess = ({ count, file }: TransactionExportStatusProperties): JSX.Element => {
	const { t } = useTranslation();

	return (
		<div data-testid="TransactionExportSuccess" className="space-y-4">
			{count === 0 ? (
				<Alert variant="warning">{t("TRANSACTION.EXPORT.EMPTY.DESCRIPTION")}</Alert>
			) : (
				<Alert variant="success">
					{t("TRANSACTION.EXPORT.SUCCESS.DESCRIPTION", { count: formatNumber(count) as never })}
				</Alert>
			)}

			<FilePreview file={file} variant="success" />
		</div>
	);
};
