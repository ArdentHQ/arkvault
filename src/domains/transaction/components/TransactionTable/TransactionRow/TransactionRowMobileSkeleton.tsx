import React from "react";
import { useTranslation } from "react-i18next";

import { Skeleton } from "@/app/components/Skeleton";
import { TableRow } from "@/app/components/Table";
import { RowLabel, RowWrapper } from "@/app/components/Table/Mobile/Row";
import { useRandomNumber } from "@/app/hooks";

export const TransactionRowMobileSkeleton = () => {
	const senderWidth = useRandomNumber(150, 150);
	const recipientWidth = useRandomNumber(130, 150);
	const amountWidth = useRandomNumber(100, 130);
	const currencyWidth = Math.floor(amountWidth * 0.75);
	const { t } = useTranslation();

	return (
		<TableRow className="group">
			<td data-testid="TransactionRow__skeleton" className="flex-col space-y-4 py-4">
				<RowWrapper>
					<RowLabel>{t("COMMON.ID")}</RowLabel>
					<Skeleton height={16} width={120} />
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.DATE")}</RowLabel>
					<Skeleton height={16} width={160} />
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.SENDER")}</RowLabel>
					<div className="mr-4 flex items-center space-x-2">
						<Skeleton height={16} width={senderWidth} />
						<Skeleton circle height={20} width={20} />
						<Skeleton circle height={20} width={20} />
					</div>
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.RECIPIENT")}</RowLabel>
					<div className="mr-4 flex items-center space-x-2">
						<Skeleton height={16} width={recipientWidth} />
						<Skeleton circle height={20} width={20} />
					</div>
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.AMOUNT")}</RowLabel>
					<div className="flex h-7 items-center space-x-1">
						<Skeleton height={16} width={amountWidth} />
						<Skeleton height={16} width={35} />
					</div>
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.CURRENCY")}</RowLabel>
					<Skeleton height={16} width={currencyWidth} />
				</RowWrapper>
			</td>
		</TableRow>
	);
};
