import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DTO } from "@ardenthq/sdk-profiles";
import { Trans, useTranslation } from "react-i18next";
import classNames from "classnames";
import { Modal } from "@/app/components/Modal";
import { MigrationAddress, MigrationDetail } from "@/domains/migration/components/MigrationAddress";
import { MigrationPolygonIcon } from "@/domains/migration/components/MigrationPolygonIcon";
import { Amount } from "@/app/components/Amount";
import { useTimeFormat } from "@/app/hooks/use-time-format";
import { useMigrations } from "@/app/contexts";
import { MigrationTransactionStatus } from "@/domains/migration/migration.contracts";
import { Icon } from "@/app/components/Icon";
import { Link } from "@/app/components/Link";
import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic";
import { Clipboard } from "@/app/components/Clipboard";
import { polygonIndexerUrl, polygonTransactionLink } from "@/utils/polygon-migration";
import { Skeleton } from "@/app/components/Skeleton";
import { httpClient } from "@/app/services";
import { Alert } from "@/app/components/Alert";
export interface MigrationDetailsModalProperties {
	transaction?: DTO.ExtendedConfirmedTransactionData;
	onClose: () => void;
}

export const MigrationDetailsModal = ({ transaction, onClose }: MigrationDetailsModalProperties) => {
	const { t } = useTranslation();

	const [transactionIsConfirmed, setTransactionIsConfirmed] = useState<boolean>();
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [polygonId, setPolygonId] = useState<string>();
	const [loadStatusError, setLoadStatusError] = useState<Error>();

	const fetchMigrationId = useCallback(async () => {
		const response = await httpClient.get(`${polygonIndexerUrl()}transactions`, {
			arkTxHashes: [transaction!.id()],
		});

		const confirmedMigration:
			| undefined
			| {
					arkTxHash: string;
					polygonTxHash: string;
			  } = JSON.parse(response.body())[0];

		if (confirmedMigration && confirmedMigration.arkTxHash === transaction!.id()) {
			return confirmedMigration.polygonTxHash;
		}
	}, [transaction]);

	const loadTransactionStatus = useCallback(async () => {
		setLoadStatusError(undefined);

		setIsLoading(true);

		let status: MigrationTransactionStatus;

		try {
			status = await getTransactionStatus(transaction!);
		} catch (error) {
			setLoadStatusError(error);

			setIsLoading(false);
			return;
		}

		const isConfirmed = status === MigrationTransactionStatus.Confirmed;

		if (isConfirmed) {
			const polygonId = await fetchMigrationId();
			setPolygonId(polygonId);
		}

		setTransactionIsConfirmed(status === MigrationTransactionStatus.Confirmed);

		setIsLoading(false);
	}, [transaction, fetchMigrationId]);

	useEffect(() => {
		if (transaction === undefined) {
			setPolygonId(undefined);
			setIsLoading(true);
			return;
		}

		loadTransactionStatus();
	}, [transaction, loadTransactionStatus]);

	const reference = useRef(null);

	const timeFormat = useTimeFormat();

	const { getTransactionStatus } = useMigrations();

	const title = useMemo(() => {
		if (isLoading) {
			return <Skeleton height={32} width={250} />;
		}

		if (loadStatusError) {
			return t("MIGRATION.DETAILS_MODAL.ERROR.TITLE");
		}

		if (transactionIsConfirmed) {
			return t("MIGRATION.DETAILS_MODAL.STEP_SUCCESS.TITLE");
		}

		return t("MIGRATION.DETAILS_MODAL.STEP_PENDING.TITLE");
	}, [transactionIsConfirmed, isLoading]);

	const description = useMemo(() => {
		if (isLoading) {
			return <Skeleton height={20} width={350} />;
		}

		if (loadStatusError) {
			return;
		}

		if (transactionIsConfirmed) {
			return t("MIGRATION.DETAILS_MODAL.STEP_SUCCESS.DESCRIPTION");
		}

		return t("MIGRATION.DETAILS_MODAL.STEP_PENDING.DESCRIPTION");
	}, [transactionIsConfirmed, isLoading]);

	if (transaction === undefined) {
		return <></>;
	}

	return (
		<Modal title={title} description={description} size="3xl" isOpen onClose={onClose}>
			<div
				ref={reference}
				data-testid="MigrationDetailsModal"
				className={classNames("flex flex-col space-y-3", {
					"pt-8": loadStatusError === undefined,
				})}
			>
				{isLoading ? (
					<div className="flex flex-col space-y-3" data-testid="MigrationDetailsModal__loading">
						<div className="flex flex-col rounded-xl border border-theme-secondary-300 dark:border-theme-secondary-800">
							<div className="flex flex-col space-y-5 p-5">
								<div className="flex flex-col space-y-2">
									<Skeleton height={16} width={30} />

									<Skeleton height={20} width={170} />
								</div>

								<div className="flex flex-col space-y-2">
									<Skeleton height={16} width={150} />

									<div className="flex space-x-2">
										<Skeleton circle height={20} width={20} />

										<Skeleton height={20} width={360} />
									</div>
								</div>
							</div>
							<div className="flex flex-col space-y-5 border-t border-theme-secondary-300 p-5 dark:border-theme-secondary-800">
								<div className="flex flex-col space-y-2">
									<Skeleton height={16} width={150} />

									<div className="flex space-x-2">
										<Skeleton circle height={20} width={20} />

										<Skeleton height={20} width={360} />
									</div>
								</div>

								<div className="flex flex-col space-y-2">
									<Skeleton height={16} width={150} />

									<Skeleton height={20} width={170} />
								</div>
							</div>
						</div>

						<div className="h-21 w-full  animate-pulse rounded-xl bg-theme-secondary-100 dark:bg-black" />
					</div>
				) : (
					<>
						{loadStatusError !== undefined && (
							<Alert variant="danger">{t("MIGRATION.DETAILS_MODAL.ERROR.DESCRIPTION")}</Alert>
						)}

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
										<Amount
											value={transaction.amount()}
											ticker="ARK"
											className="text-lg font-semibold"
										/>
									</MigrationDetail>
								</div>

								<div className="flex overflow-hidden rounded-xl">
									<div className="flex flex-1 flex-col bg-theme-secondary-100 p-5 dark:bg-black">
										<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
											{t("MIGRATION.TRANSACTION_ID")}
										</span>
										<span className="overflow-hidden">
											<Link
												to={polygonTransactionLink(polygonId!)}
												tooltip={polygonId}
												showExternalIcon={false}
												isExternal
											>
												<TruncateMiddleDynamic
													offset={96}
													value={polygonId!}
													parentRef={reference}
												/>
											</Link>
										</span>
									</div>

									<div className="flex items-center bg-theme-navy-100 px-5 text-theme-navy-600 dark:bg-theme-secondary-800 dark:text-theme-secondary-200">
										<Clipboard variant="icon" data={polygonId!}>
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
										<span className="font-semibold">
											{transaction.timestamp()!.format(timeFormat)}
										</span>
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
										<Amount
											value={transaction.amount()}
											ticker="ARK"
											className="text-lg font-semibold"
										/>
									</MigrationDetail>
								</div>

								{loadStatusError === undefined && (
									<div className="flex items-center justify-between overflow-hidden rounded-xl bg-theme-secondary-100 p-5 dark:bg-black">
										<span className="whitespace-pre-line text-sm">
											<Trans i18nKey="MIGRATION.MIGRATION_ADD.STEP_PENDING.MIGRATION_INFO" />
										</span>
									</div>
								)}
							</>
						)}
					</>
				)}
			</div>
		</Modal>
	);
};
