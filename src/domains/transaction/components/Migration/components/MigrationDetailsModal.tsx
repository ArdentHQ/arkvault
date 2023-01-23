import React, { useMemo, useRef } from "react";

import { DTO } from "@ardenthq/sdk-profiles";
import { Trans, useTranslation } from "react-i18next";
import { Modal } from "@/app/components/Modal";
import { MigrationAddress, MigrationDetail } from "@/domains/migration/components/MigrationAddress";
import { MigrationPolygonIcon } from "@/domains/migration/components/MigrationPolygonIcon";
import { Amount } from "@/app/components/Amount";
import { useTimeFormat } from "@/app/hooks/use-time-format";
import { useMigrations } from "@/app/contexts";
import { Icon } from "@/app/components/Icon";
import { Link } from "@/app/components/Link";
import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic";
import { Clipboard } from "@/app/components/Clipboard";
import { polygonTransactionLink } from "@/utils/polygon-migration";
import { MigrationTransactionStatus } from "@/domains/migration/migration.contracts";
export interface MigrationDetailsModalProperties {
	transaction?: DTO.ExtendedConfirmedTransactionData;
	onClose: () => void;
}

export const MigrationDetailsModal = ({ transaction, onClose }: MigrationDetailsModalProperties) => {
	const { t } = useTranslation();

	const { migrations } = useMigrations();

	const transactionIsConfirmed = useMemo(() => {
		if (migrations === undefined || transaction === undefined) {
			return;
		}

		const migrationTransaction = migrations.find((migration) => migration.transaction.id() === transaction.id());

		if (migrationTransaction === undefined) {
			return;
		}

		return migrationTransaction.status === MigrationTransactionStatus.Confirmed;
	}, [transaction, migrations]);

	const reference = useRef(null);

	const timeFormat = useTimeFormat();

	const title = useMemo(() => {
		if (transactionIsConfirmed) {
			return t("MIGRATION.DETAILS_MODAL.STEP_SUCCESS.TITLE");
		}

		return t("MIGRATION.DETAILS_MODAL.STEP_PENDING.TITLE");
	}, [transactionIsConfirmed]);

	const description = useMemo(() => {
		if (transactionIsConfirmed) {
			return t("MIGRATION.DETAILS_MODAL.STEP_SUCCESS.DESCRIPTION");
		}

		return t("MIGRATION.DETAILS_MODAL.STEP_PENDING.DESCRIPTION");
	}, [transactionIsConfirmed]);

	const polygonId = useMemo(() => {
		if (transaction === undefined) {
			return "";
		}

		return `0x${transaction.id()}`;
	}, [transaction]);

	if (!transaction || transactionIsConfirmed === undefined) {
		return <></>;
	}

	return (
		<Modal title={title} description={description} size="3xl" isOpen onClose={onClose}>
			<div data-testid="MigrationDetailsModal" className="flex flex-col space-y-3 pt-8">
				{transactionIsConfirmed ? (
					<>
						<div
							data-testid="MigrationDetailsModal__confirmed"
							className="flex flex-col rounded-xl border border-theme-secondary-300 dark:border-theme-secondary-800"
						>
							<MigrationAddress
								label={t("MIGRATION.POLYGON_ADDRESS")}
								address={transaction.memo() || ""}
							/>

							<div className="relative border-t border-theme-secondary-300 dark:border-theme-secondary-800">
								<div className="absolute top-1/2 right-6 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-theme-secondary-300 bg-theme-background dark:border-theme-secondary-800">
									<div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-theme-navy-600 bg-theme-navy-100 text-theme-navy-600 dark:bg-transparent">
										<Icon name="CheckmarkSmall" size="sm" />
									</div>
								</div>
							</div>

							<MigrationDetail label={t("COMMON.AMOUNT")}>
								<Amount value={transaction.amount()} ticker="ARK" className="text-lg font-semibold" />
							</MigrationDetail>
						</div>

						<div className="flex overflow-hidden rounded-xl">
							<div className="flex flex-1 flex-col bg-theme-secondary-100 p-5 dark:bg-black">
								<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
									{t("MIGRATION.TRANSACTION_ID")}
								</span>
								<span ref={reference} className="overflow-hidden">
									<Link
										to={polygonTransactionLink(polygonId)}
										tooltip={polygonId}
										showExternalIcon={false}
										isExternal
									>
										<TruncateMiddleDynamic value={polygonId} parentRef={reference} />
									</Link>
								</span>
							</div>

							<div className="flex items-center bg-theme-navy-100 px-5 text-theme-navy-600 dark:bg-theme-secondary-800 dark:text-theme-secondary-200">
								<Clipboard variant="icon" data={polygonId}>
									<Icon name="Copy" />
								</Clipboard>
							</div>
						</div>
					</>
				) : (
					<>
						<div
							data-testid="MigrationDetailsModal__pending"
							className="flex flex-col rounded-xl border border-theme-secondary-300 dark:border-theme-secondary-800"
						>
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
					</>
				)}
			</div>
		</Modal>
	);
};
