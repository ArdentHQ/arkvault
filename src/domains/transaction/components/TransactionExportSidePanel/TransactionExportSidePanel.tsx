import React, { JSX, useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useTransactionExport } from "./hooks";
import { useTransactionExportForm } from "./TransactionExportForm/hooks";
import { useFileDownload } from "./TransactionExportSuccess/hooks/use-file-download";
import {
	TransactionExportProgress,
	TransactionExportSuccess,
	TransactionExportSidePanelProperties,
	TransactionExportForm,
	TransactionExportError,
	ExportProgressStatus,
} from ".";
import { Button } from "@/app/components/Button";
import { Form } from "@/app/components/Form";
import { SidePanel, SidePanelButtons } from "@/app/components/SidePanel/SidePanel";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { toasts } from "@/app/services";
import { useActiveProfile } from "@/app/hooks";

const TOTAL_STEPS = 3;

export const TransactionExportSidePanel = ({
	open,
	onOpenChange,
	onMountChange,
	wallets,
}: TransactionExportSidePanelProperties): JSX.Element => {
	const { t } = useTranslation();

	const profile = useActiveProfile();

	const { count, finalCount, file, startExport, cancelExport, status, error } = useTransactionExport({
		profile,
		wallets,
	});

	const { download } = useFileDownload();

	const form = useTransactionExportForm();
	const { isDirty, isSubmitting, isValid } = form.formState;

	const showFiatColumn = !!wallets.at(0)?.network().isLive();

	useEffect(() => {
		if (showFiatColumn) {
			form.register("includeFiatAmount");
		}
	}, [showFiatColumn]);

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			cancelExport();
		}

		onOpenChange(isOpen);
	};

	const handleClose = () => handleOpenChange(false);

	const handleSubmit = () => {
		void startExport(form.getValues());
	};

	const handleDownload = async () => {
		const filename = await download(file);

		if (!filename) {
			return;
		}

		toasts.success(<Trans i18nKey="COMMON.SAVE_FILE.SUCCESS" values={{ filePath: filename }} />);

		handleClose();
	};

	const renderFooter = () => {
		if (status === ExportProgressStatus.Progress) {
			return (
				<SidePanelButtons>
					<Button
						variant="secondary"
						onClick={cancelExport}
						data-testid="TransactionExportProgress__cancel-button"
					>
						{t("COMMON.CANCEL")}
					</Button>

					<Button variant="primary" disabled>
						{t("COMMON.DOWNLOAD")}
					</Button>
				</SidePanelButtons>
			);
		}

		if (status === ExportProgressStatus.Success) {
			return (
				<SidePanelButtons>
					<Button
						variant="secondary"
						onClick={handleClose}
						data-testid="TransactionExportSuccess__close-button"
					>
						{t("COMMON.CLOSE")}
					</Button>

					<Button
						disabled={finalCount === 0}
						variant="primary"
						onClick={handleDownload}
						data-testid="TransactionExportSuccess__download-button"
					>
						{t("COMMON.DOWNLOAD")}
					</Button>
				</SidePanelButtons>
			);
		}

		if (status === ExportProgressStatus.Error) {
			return (
				<SidePanelButtons>
					<Button
						variant="secondary"
						onClick={handleClose}
						data-testid="TransactionExportError__close-button"
					>
						{t("COMMON.CLOSE")}
					</Button>

					{finalCount > 0 && (
						<Button
							variant="secondary"
							onClick={handleDownload}
							data-testid="TransactionExportError__download"
						>
							{t("COMMON.DOWNLOAD")}
						</Button>
					)}

					<Button variant="primary" onClick={handleSubmit} data-testid="TransactionExportError__retry-button">
						{t("COMMON.TRY_AGAIN")}
					</Button>
				</SidePanelButtons>
			);
		}

		return (
			<SidePanelButtons>
				<Button variant="secondary" onClick={handleClose} data-testid="TransactionExportForm__cancel-button">
					{t("COMMON.CANCEL")}
				</Button>

				<Button
					disabled={isSubmitting || (isDirty ? !isValid : false)}
					variant="primary"
					onClick={form.handleSubmit(handleSubmit)}
					data-testid="TransactionExport__submit-button"
				>
					{t("COMMON.EXPORT")}
				</Button>
			</SidePanelButtons>
		);
	};

	return (
		<SidePanel
			open={open}
			onOpenChange={handleOpenChange}
			onMountChange={onMountChange}
			title={t("TRANSACTION.EXPORT.TITLE")}
			subtitle={t("TRANSACTION.EXPORT.DESCRIPTION")}
			dataTestId="TransactionExportSidePanel"
			hasSteps
			totalSteps={TOTAL_STEPS}
			activeStep={Math.min(status, TOTAL_STEPS)}
			onBack={cancelExport}
			isLastStep={status === ExportProgressStatus.Success}
			footer={renderFooter()}
		>
			<Form context={form} onSubmit={handleSubmit}>
				<Tabs activeId={status}>
					<TabPanel tabId={ExportProgressStatus.Idle}>
						<TransactionExportForm profile={profile} wallets={wallets} />
					</TabPanel>

					<TabPanel tabId={ExportProgressStatus.Progress}>
						<TransactionExportProgress count={count} file={file} />
					</TabPanel>

					<TabPanel tabId={ExportProgressStatus.Success}>
						<TransactionExportSuccess count={finalCount} file={file} />
					</TabPanel>

					<TabPanel tabId={ExportProgressStatus.Error}>
						<TransactionExportError error={error} file={file} />
					</TabPanel>
				</Tabs>
			</Form>
		</SidePanel>
	);
};
