import React from "react";

import { useTranslation } from "react-i18next";
import { Skeleton } from "@/app/components/Skeleton";
import { TableRow } from "@/app/components/Table";
import { useRandomNumber } from "@/app/hooks";
import { RowWrapper, RowLabel } from "@/app/components/Table/Mobile/Row";

export const NotificationTransactionItemMobileSkeleton = () => {
	const senderWidth = useRandomNumber(80, 120);
	const amountWidth = useRandomNumber(100, 100);
	const { t } = useTranslation();

	return (
		<TableRow className="group">
			<td className="flex-col space-y-4 px-6 py-4" data-testid="TransactionRow__skeleton__mobile">
				<RowWrapper>
					<RowLabel>{t("COMMON.ADDRESS")}</RowLabel>
					<Skeleton height={16} width={senderWidth} />
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.AMOUNT")}</RowLabel>
					<Skeleton height={16} width={amountWidth} />
				</RowWrapper>
			</td>
		</TableRow>
	);
};
