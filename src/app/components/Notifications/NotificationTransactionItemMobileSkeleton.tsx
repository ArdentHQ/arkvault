import React from "react";
import { useTranslation } from "react-i18next";

import { Skeleton } from "@/app/components/Skeleton";
import { TableRow } from "@/app/components/Table";
import { RowLabel, RowWrapper } from "@/app/components/Table/Mobile/Row";
import { useRandomNumber } from "@/app/hooks";

export const NotificationTransactionItemMobileSkeleton = () => {
	const senderWidth = useRandomNumber(80, 120);
	const amountWidth = useRandomNumber(100, 100);
	const { t } = useTranslation();

	return (
		<TableRow className="group">
			<td data-testid="TransactionRow__skeleton__mobile" className="flex-col space-y-4 py-4">
				<RowWrapper>
					<RowLabel>{t("COMMON.SENDER")}</RowLabel>
					<div className="mr-4 flex items-center space-x-2">
						<Skeleton height={16} width={senderWidth} />
						<Skeleton circle height={20} width={20} />
						<Skeleton circle height={20} width={20} />
					</div>
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.AMOUNT")}</RowLabel>
					<div className="flex h-7 items-center space-x-1">
						<Skeleton height={16} width={amountWidth} />
						<Skeleton height={16} width={25} />
					</div>
				</RowWrapper>
			</td>
		</TableRow>
	);
};
