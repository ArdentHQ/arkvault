import React, { useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";

import { Form } from "@/app/components/Form";
import { Modal } from "@/app/components/Modal";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { useActiveProfile } from "@/app/hooks";
import { toasts } from "@/app/services";

import {
	ExportProgressStatus,
	TransactionExportError,
	TransactionExportForm,
	TransactionExportModalProperties,
	TransactionExportProgress,
	TransactionExportSuccess,
} from ".";
import { useTransactionExport } from "./hooks";
import { useTransactionExportForm } from "./TransactionExportForm/hooks";

export const TransactionExportModal = ({ wallet, isOpen, onClose }: TransactionExportModalProperties) => {
	const { t } = useTranslation();

	const profile = useActiveProfile();

	const { count, finalCount, file, startExport, cancelExport, status, resetStatus, error } = useTransactionExport({
		profile,
		wallet,
	});

	const form = useTransactionExportForm();

	const showFiatColumn = wallet.network().isLive();

	useEffect(() => {
		if (showFiatColumn) {
			form.register("includeFiatAmount");
		}
	}, [showFiatColumn]);

	const handleSubmit = () => {
		startExport(form.getValues());
	};

	return (
		<Modal
			title={t("TRANSACTION.EXPORT.TITLE")}
			description={t("TRANSACTION.EXPORT.DESCRIPTION")}
			isOpen={isOpen}
			onClose={() => {
				cancelExport();
				onClose();
			}}
		>
			<Form context={form} onSubmit={handleSubmit} className="mt-8">
				<Tabs activeId={status}>
					<TabPanel tabId={ExportProgressStatus.Idle}>
						<TransactionExportForm wallet={wallet} onCancel={onClose} />
					</TabPanel>

					<TabPanel tabId={ExportProgressStatus.Progress}>
						<TransactionExportProgress count={count} file={file} onCancel={cancelExport} />
					</TabPanel>

					<TabPanel tabId={ExportProgressStatus.Success}>
						<TransactionExportSuccess
							count={finalCount}
							file={file}
							onBack={resetStatus}
							onDownload={(filename: string) => {
								toasts.success(
									<Trans i18nKey="COMMON.SAVE_FILE.SUCCESS" values={{ filePath: filename }} />,
								);
								onClose();
							}}
						/>
					</TabPanel>

					<TabPanel tabId={ExportProgressStatus.Error}>
						<TransactionExportError
							error={error}
							count={finalCount}
							onDownload={(filename: string) => {
								toasts.success(
									<Trans i18nKey="COMMON.SAVE_FILE.SUCCESS" values={{ filePath: filename }} />,
								);
								onClose();
							}}
							file={file}
							onBack={resetStatus}
							onRetry={handleSubmit}
						/>
					</TabPanel>
				</Tabs>
			</Form>
		</Modal>
	);
};
