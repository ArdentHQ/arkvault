import React from "react";
import VisibilitySensor from "react-visibility-sensor";

import { useTranslation } from "react-i18next";
import { NotificationTransactionItemProperties } from "./Notifications.contracts";
import { TableRow } from "@/app/components/Table";
import { TransactionRowAmount } from "@/domains/transaction/components/TransactionTable/TransactionRow/TransactionRowAmount";
import { RowWrapper, RowLabel } from "@/app/components/Table/Mobile/Row";
import { Avatar } from "@/app/components/Avatar";
import { TransactionRowSender } from "@/domains/transaction/components/TransactionTable/TransactionRow/TransactionRowSender";

export const NotificationTransactionItemMobile = ({
	transaction,
	profile,
	containmentRef,
	onTransactionClick,
}: NotificationTransactionItemProperties) => {
	const { t } = useTranslation();

	return (
		<VisibilitySensor scrollCheck delayedCall containment={containmentRef?.current}>
			<TableRow onClick={() => onTransactionClick?.(transaction)}>
				<td className="flex-col space-y-4 py-4">
					<RowWrapper>
						<RowLabel>{t("COMMON.SENDER")}</RowLabel>
						<div className="flex w-full items-center space-x-0 text-right">
							<TransactionRowSender
								transaction={transaction}
								profile={profile}
								labelClass="pr-2"
								showTransactionMode={false}
							/>

							<Avatar size="xs" address={transaction.sender()} noShadow />
						</div>
					</RowWrapper>

					<RowWrapper>
						<RowLabel>{t("COMMON.AMOUNT")}</RowLabel>
						<TransactionRowAmount transaction={transaction} exchangeTooltip isCompact={false} />
					</RowWrapper>
				</td>
			</TableRow>
		</VisibilitySensor>
	);
};
