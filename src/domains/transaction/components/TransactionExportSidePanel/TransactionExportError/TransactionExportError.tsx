import { Alert } from "@/app/components/Alert";
import { FilePreview } from "@/domains/profile/components/FilePreview";
import React, { JSX } from "react";
import { TransactionExportErrorProperties } from "@/domains/transaction/components/TransactionExportSidePanel";

export const TransactionExportError = ({ error, file }: TransactionExportErrorProperties): JSX.Element => (
	<div data-testid="TransactionExportError" className="space-y-4">
		<Alert variant="danger">{error}</Alert>

		<FilePreview file={file} variant="danger" />
	</div>
);
