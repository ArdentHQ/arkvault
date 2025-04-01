import React, { useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useTransactionExport } from "./hooks";
import { useTransactionExportForm } from "./TransactionExportForm/hooks";
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
import { Form } from "@/app/components/Form";

export const TransactionExportModal = ({ wallets, isOpen, onClose }: TransactionExportModalProperties) => {
	const { t } = useTranslation();

	const profile = useActiveProfile();

	const { count, finalCount, file, startExport, cancelExport, status, resetStatus, error } = useTransactionExport({
		profile,
		wallets,
	});

	const form = useTransactionExportForm();

	const showFiatColumn = wallets[0].network().isLive();

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
			<Form context={form} onSubmit={handleSubmit} className="mt-4">
				<Tabs activeId={status}>
					<TabPanel tabId={ExportProgressStatus.Idle}>
						<TransactionExportForm profile={profile} wallets={wallets} onCancel={onClose} />
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
