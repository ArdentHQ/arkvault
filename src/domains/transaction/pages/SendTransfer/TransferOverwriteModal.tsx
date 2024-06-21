import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/app/components/Modal";
import { Alert } from "@/app/components/Alert";
import { FormButtons } from "@/app/components/Form";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { Checkbox } from "@/app/components/Checkbox";

export type TransferFormData = Record<string, string | null>;

interface TransferOverwriteModalProperties {
	isOpen: boolean;
	onCancel: () => void;
	onConfirm: (clearPrefilled: boolean) => void;
	newData: TransferFormData;
	currentData: TransferFormData;
}

const DetailLabel = ({ label }: { label: string }) => (
	<div className="mb-2 text-sm font-semibold text-theme-secondary-text">{label}</div>
);

const OverwriteDetail = ({ currentValue, newValue }: { currentValue: string | null; newValue: string | null }) => {
	const { t } = useTranslation();

	return (
		<div className="flex rounded-xl border border-theme-secondary-300 dark:border-theme-secondary-800">
			<div className="flex-1 border-r border-theme-secondary-300 dark:border-theme-secondary-800">
				<div
					className="border-b border-theme-secondary-300 px-3 py-2.5 dark:border-theme-secondary-800"
					data-testid="OverwriteDetail__Current"
				>
					<DetailLabel label="Current value" />
					{currentValue ? (
						<div className="font-medium text-theme-secondary-900 dark:text-theme-secondary-200">{currentValue}</div>
					) : (
						<div className="font-medium text-theme-secondary-500">{t("COMMON.NOT_AVAILABLE")}</div>
					)}
				</div>
				<div className="px-3 py-2.5" data-testid="OverwriteDetail__New">
					<DetailLabel label="New value" />
					{newValue ? (
						<div className="font-medium text-theme-secondary-900 dark:text-theme-secondary-200">{newValue}</div>
					) : (
						<div className="font-medium text-theme-secondary-500">{t("COMMON.NOT_AVAILABLE")}</div>
					)}
				</div>
			</div>
			<div className="flex items-center px-3.5">
				<Icon name="ArrowDown" size="lg" />
			</div>
		</div>
	);
};

export const TransferOverwriteModal = ({
	isOpen,
	onCancel,
	onConfirm,
	newData,
	currentData,
}: TransferOverwriteModalProperties) => {
	const { t } = useTranslation();

	const [clearPrefilled, setClearPrefilled] = useState(true);

	return (
		<Modal
			isOpen={isOpen}
			title={t("TRANSACTION.MODAL_OVERWRITE_VALUES.TITLE")}
			size="2xl"
			noButtons
			onClose={onCancel}
			data-testid="TransferOverwriteModal"
		>
			<Alert>{t("TRANSACTION.MODAL_OVERWRITE_VALUES.WARNING")}</Alert>

			<div className="space-y-6 pt-6">
				{(currentData.recipientAddress || newData.recipientAddress) && (
					<div data-testid="OverwriteModal__Recipient">
						<DetailLabel label={t("COMMON.RECIPIENT")} />
						<OverwriteDetail
							currentValue={currentData.recipientAddress}
							newValue={newData.recipientAddress}
						/>
					</div>
				)}

				{(currentData.amount || newData.amount) && (
					<div data-testid="OverwriteModal__Amount">
						<DetailLabel label={t("COMMON.AMOUNT")} />
						<OverwriteDetail currentValue={currentData.amount} newValue={newData.amount} />
					</div>
				)}

				{(currentData.memo || newData.memo) && (
					<div data-testid="OverwriteModal__Memo">
						<DetailLabel label={t("COMMON.MEMO")} />
						<OverwriteDetail currentValue={currentData.memo} newValue={newData.memo} />
					</div>
				)}
			</div>

			<label className="mt-4 inline-flex cursor-pointer items-center space-x-3 text-theme-secondary-text">
				<Checkbox
					data-testid="OverwriteModal__clear_prefilled"
					checked={clearPrefilled}
					onChange={() => setClearPrefilled(!clearPrefilled)}
				/>
				<span>{t("TRANSACTION.MODAL_OVERWRITE_VALUES.CLEAR_PREFILLED_LABEL")}</span>
			</label>

			<FormButtons>
				<Button variant="secondary" onClick={onCancel} data-testid="OverwriteModal__cancel-button">
					{t("COMMON.CANCEL")}
				</Button>

				<Button data-testid="OverwriteModal__confirm-button" onClick={() => onConfirm(clearPrefilled)}>
					{t("COMMON.CONFIRM")}
				</Button>
			</FormButtons>
		</Modal>
	);
};
