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
	<div className="mb-2 text-sm font-semibold text-theme-secondary-500">{label}</div>
);

const OverwriteDetail = ({ currentNode, newNode }: { currentNode: ReactNode; newNode: ReactNode }) => (
	<div className="flex rounded-xl border border-theme-secondary-300 dark:border-theme-secondary-800">
		<div className="flex-1 min-w-0 border-r border-theme-secondary-300 dark:border-theme-secondary-800">
			<div
				className="py-2.5 px-3 border-b border-theme-secondary-300 dark:border-theme-secondary-800"
				data-testid="OverwriteDetail__Current"
			>
				<DetailLabel label="Current value" />
				<div className="flex flex-1 w-full">{currentNode}</div>
			</div>
			<div className="py-2.5 px-3" data-testid="OverwriteDetail__New">
				<DetailLabel label="New value" />
				<div className="flex flex-1 w-full">{newNode}</div>
			</div>
		</div>
		<div className="flex items-center px-3.5">
			<Icon name="ArrowDown" size="lg" />
		</div>
	</div>
);

const AvailableValue = ({ value }: { value: string }) => (
	<div className="font-medium text-theme-secondary-900 truncate dark:text-theme-secondary-200">{value}</div>
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
			<Alert className="mt-2.5">{t("TRANSACTION.MODAL_OVERWRITE_VALUES.WARNING")}</Alert>

			<div className="pt-4 space-y-4">
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

			<label className="inline-flex items-center pb-10 mt-4 space-x-3 cursor-pointer md:pb-0 text-theme-secondary-text">
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
