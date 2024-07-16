import React, { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/app/components/Modal";
import { Alert } from "@/app/components/Alert";
import { FormButtons } from "@/app/components/Form";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { Checkbox } from "@/app/components/Checkbox";
import { Address } from "@/app/components/Address";

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

const OverwriteDetail = ({ currentNode, newNode }: { currentNode: ReactNode; newNode: ReactNode }) => (
	<div className="flex rounded-xl border border-theme-secondary-300 dark:border-theme-secondary-800">
		<div className="min-w-0 flex-1 border-r border-theme-secondary-300 dark:border-theme-secondary-800">
			<div
				className="border-b border-theme-secondary-300 px-3 py-2.5 dark:border-theme-secondary-800"
				data-testid="OverwriteDetail__Current"
			>
				<DetailLabel label="Current value" />
				<div className="flex w-full flex-1">{currentNode}</div>
			</div>
			<div className="px-3 py-2.5" data-testid="OverwriteDetail__New">
				<DetailLabel label="New value" />
				<div className="flex w-full flex-1">{newNode}</div>
			</div>
		</div>
		<div className="flex items-center px-3.5">
			<Icon name="ArrowDown" size="lg" />
		</div>
	</div>
);

const AvailableValue = ({ value }: { value: string }) => (
	<div className="truncate font-medium text-theme-secondary-900 dark:text-theme-secondary-200">{value}</div>
);

const UnavailableValue = () => {
	const { t } = useTranslation();

	return <div className="font-medium text-theme-secondary-500">{t("COMMON.NOT_AVAILABLE")}</div>;
};

const DetailText = ({ value }: { value: string | null }) =>
	value ? <AvailableValue value={value} /> : <UnavailableValue />;

export const TransferOverwriteModal = ({
	isOpen,
	onCancel,
	onConfirm,
	newData,
	currentData,
}: TransferOverwriteModalProperties) => {
	const { t } = useTranslation();

	const [clearPrefilled, setClearPrefilled] = useState(true);

	const { recipientAddress: newRecipient, amount: newAmount, memo: newMemo } = newData;
	const { recipientAddress: currentRecipient, amount: currentAmount, memo: currentMemo } = currentData;

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
				{(currentRecipient || newRecipient) && (
					<div data-testid="OverwriteModal__Recipient">
						<DetailLabel label={t("COMMON.RECIPIENT")} />
						<OverwriteDetail
							currentNode={
								currentRecipient ? (
									<Address
										address={currentRecipient}
										orientation="vertical"
										addressClass="font-medium text-theme-secondary-900 dark:text-theme-secondary-200"
									/>
								) : (
									<UnavailableValue />
								)
							}
							newNode={
								newRecipient ? (
									<Address
										address={newRecipient}
										addressClass="font-medium text-theme-secondary-900 dark:text-theme-secondary-200"
									/>
								) : (
									<UnavailableValue />
								)
							}
						/>
					</div>
				)}

				{(currentAmount || newAmount) && (
					<div data-testid="OverwriteModal__Amount">
						<DetailLabel label={t("COMMON.AMOUNT")} />
						<OverwriteDetail
							currentNode={<DetailText value={currentAmount} />}
							newNode={<DetailText value={newAmount} />}
						/>
					</div>
				)}

				{(currentMemo || newMemo) && (
					<div data-testid="OverwriteModal__Memo">
						<DetailLabel label={t("COMMON.MEMO")} />
						<OverwriteDetail
							currentNode={<DetailText value={currentMemo} />}
							newNode={<DetailText value={newMemo} />}
						/>
					</div>
				)}
			</div>

			<label className="mt-4 inline-flex cursor-pointer items-center space-x-3 pb-10 text-theme-secondary-text md:pb-0">
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
