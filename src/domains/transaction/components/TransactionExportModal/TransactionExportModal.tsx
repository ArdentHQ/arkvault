import React, { useState } from "react";
import { Modal } from "@/app/components/Modal";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { Trans, useTranslation } from "react-i18next";
import { toasts } from "@/app/services";

import { useTransactionExport } from "./hooks";
import {
	TransactionExportProgress,
	TransactionExportSuccess,
	TransactionExportModalProperties,
	TransactionExportForm,
	TransactionExportError,
	ExportProgressStatus,
} from "./";

export const TransactionExportModal = ({
	initialStatus = ExportProgressStatus.Idle,
	isOpen,
	onClose,
	wallet,
}: TransactionExportModalProperties) => {
	const { t } = useTranslation();

	const { file, startExport, cancelExport, status, error } = useTransactionExport({
		wallet,
		initialStatus,
	});

	return (
		<Modal
			title={t("TRANSACTION.EXPORT.TITLE")}
			description={t("TRANSACTION.EXPORT.DESCRIPTION")}
			isOpen={isOpen}
			onClose={onClose}
		>
			<Tabs activeId={status}>
				<TabPanel tabId={ExportProgressStatus.Idle}>
					<TransactionExportForm onCancel={onClose} onExport={startExport} />
				</TabPanel>

				<TabPanel tabId={ExportProgressStatus.Progress}>
					<TransactionExportProgress
						file={file}
						onCancel={() => {
							cancelExport();
							onClose?.();
						}}
					/>
				</TabPanel>

				<TabPanel tabId={ExportProgressStatus.Success}>
					<TransactionExportSuccess
						file={file}
						onCancel={onClose}
						onDownload={() => {
							toasts.success(
								<Trans
									i18nKey="COMMON.SAVE_FILE.SUCCESS"
									values={{ filePath: `${file.name}.${file.extension}` }}
								/>,
							);
							onClose?.();
						}}
					/>
				</TabPanel>

				<TabPanel tabId={ExportProgressStatus.Error}>
					<TransactionExportError file={file} onClose={onClose} onRetry={startExport} error={error} />
				</TabPanel>
			</Tabs>
		</Modal>
	);
};
