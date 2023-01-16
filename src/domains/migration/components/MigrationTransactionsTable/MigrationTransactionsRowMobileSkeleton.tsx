import React from "react";

import { useTranslation } from "react-i18next";
import { Skeleton } from "@/app/components/Skeleton";
import { TableRow } from "@/app/components/Table";
import { useRandomNumber } from "@/app/hooks";
import { RowWrapper, RowLabel } from "@/app/components/Table/Mobile/Row";

export const MigrationTransactionsRowMobileSkeleton = () => {
	const senderWidth = useRandomNumber(150, 150);
	const recipientWidth = useRandomNumber(130, 150);
	const amountWidth = useRandomNumber(100, 130);
	const { t } = useTranslation();

	return (
		<TableRow className="group">
			<td className="flex-col space-y-4 py-4">
				<RowWrapper>
					<RowLabel>{t("COMMON.ID")}</RowLabel>
					<Skeleton height={16} width={120} />
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.TIMESTAMP")}</RowLabel>
					<Skeleton height={16} width={160} />
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.SENDER")}</RowLabel>
					<div className="flex items-center space-x-2">
						<Skeleton height={16} width={senderWidth} />
						<Skeleton circle height={20} width={20} />
					</div>
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.MIGRATION_ADDRESS")}</RowLabel>
					<div className="flex items-center space-x-2">
						<Skeleton height={16} width={recipientWidth} />
						<Skeleton circle height={20} width={20} />
					</div>
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.AMOUNT")}</RowLabel>
					<div className="flex items-center space-x-1">
						<Skeleton height={16} width={amountWidth} />
						<Skeleton height={16} width={35} />
					</div>
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.STATUS")}</RowLabel>
					<div className="flex items-center space-x-2">
						<Skeleton height={16} width={80} />
						<Skeleton circle height={20} width={20} />
					</div>
				</RowWrapper>

				<RowWrapper>
					<div className="flex w-full items-center justify-end">
						<div className="block w-full sm:hidden">
							<Skeleton height={44} />
						</div>

						<div className="hidden sm:block">
							<Skeleton height={44} width={140} />
						</div>
					</div>
				</RowWrapper>
			</td>
		</TableRow>
	);
};
