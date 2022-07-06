import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { useTransactionExport } from "./hooks";
import {
	TransactionExportProgress,
	TransactionExportSuccess,
	TransactionExportModalProperties,
	TransactionExportForm,
	TransactionExportError,
	ExportProgressStatus,
} from ".";
import { Modal } from "@/app/components/Modal";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { toasts } from "@/app/services";
import { useActiveProfile } from "@/app/hooks";

export const TransactionExportModal = ({
	initialStatus = ExportProgressStatus.Idle,
	isOpen,
	onClose,
	wallet,
}: TransactionExportModalProperties) => {
	const { t } = useTranslation();

	const profile = useActiveProfile();

	const { count, file, startExport, cancelExport, status, error, retry } = useTransactionExport({
		initialStatus,
		profile,
		wallet,
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
					<TransactionExportForm onCancel={onClose} onExport={startExport} wallet={wallet} />
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
						count={count}
						file={file}
						onCancel={onClose}
						onDownload={(filename: string) => {
							toasts.success(
								<Trans i18nKey="COMMON.SAVE_FILE.SUCCESS" values={{ filePath: filename }} />,
							);
							onClose?.();
						}}
					/>
				</TabPanel>

				<TabPanel tabId={ExportProgressStatus.Error}>
					<TransactionExportError file={file} onClose={onClose} onRetry={retry} error={error} />
				</TabPanel>
			</Tabs>
		</Modal>
	);
};
