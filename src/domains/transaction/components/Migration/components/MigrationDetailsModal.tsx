import React from "react";

import { DTO } from "@ardenthq/sdk-profiles";
import { Trans, useTranslation } from "react-i18next";
import { Modal } from "@/app/components/Modal";
import { MigrationAddress, MigrationDetail } from "@/domains/migration/components/MigrationAddress";
import { MigrationPolygonIcon } from "@/domains/migration/components/MigrationPolygonIcon";
import { Amount } from "@/app/components/Amount";
import { useTimeFormat } from "@/app/hooks/use-time-format";
export interface MigrationDetailsModalProperties {
	transaction?: DTO.ExtendedConfirmedTransactionData;
	onClose: () => void;
}

export const MigrationDetailsModal = ({ transaction, onClose }: MigrationDetailsModalProperties) => {
	const { t } = useTranslation();

	const timeFormat = useTimeFormat();

	if (!transaction) {
		return <></>;
	}

	return (
		<Modal
			title={t("MIGRATION.MIGRATION_ADD.STEP_PENDING.TITLE")}
			description={t("MIGRATION.MIGRATION_ADD.STEP_PENDING.DESCRIPTION")}
			size="3xl"
			isOpen
			onClose={onClose}
		>
			<div data-testid="MigrationDetailsModal" className="flex flex-col space-y-3 pt-8">
				<div className="flex flex-col rounded-xl border border-theme-secondary-300 dark:border-theme-secondary-800">
					<MigrationDetail label={t("COMMON.DATE")} className="px-5 pt-6 pb-5">
						<span className="font-semibold">{transaction.timestamp()!.format(timeFormat)}</span>
					</MigrationDetail>

					<MigrationAddress
						address={transaction.sender()}
						className="px-5 pb-6"
						label={t("MIGRATION.MIGRATION_ADD.FROM_ARK_ADDRESS")}
					/>

					<div className="relative border-t border-theme-secondary-300 dark:border-theme-secondary-800">
						<div className="absolute top-1/2 right-6 flex h-11 w-11 -translate-y-1/2 items-center justify-center">
							<MigrationPolygonIcon />
						</div>
					</div>

					<MigrationAddress
						address={transaction.memo() || ""}
						className="px-5 pt-6 pb-5"
						label={t("MIGRATION.MIGRATION_ADD.TO_POLYGON_ADDRESS")}
						isEthereum
					/>

					<MigrationDetail label={t("COMMON.AMOUNT")} className="px-5 pb-6">
						<Amount value={transaction.amount()} ticker="ARK" className="text-lg font-semibold" />
					</MigrationDetail>
				</div>

				<div className="flex items-center justify-between overflow-hidden rounded-xl bg-theme-secondary-100 p-5 dark:bg-black">
					<span className="whitespace-pre-line text-sm">
						<Trans i18nKey="MIGRATION.MIGRATION_ADD.STEP_PENDING.MIGRATION_INFO" />
					</span>
				</div>
			</div>
		</Modal>
	);
};
