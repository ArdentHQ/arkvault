import React, { useMemo } from "react";
import VisibilitySensor from "react-visibility-sensor";

import { useTranslation } from "react-i18next";
import { NotificationTransactionItemProperties } from "./Notifications.contracts";
import { TableRow } from "@/app/components/Table";
import { RowWrapper, RowLabel } from "@/app/components/Table/Mobile/Row";
import { AmountLabel } from "@/app/components/Amount";
import { useWalletAlias } from "@/app/hooks";
import { Address } from "@/app/components/Address";

export const NotificationTransactionItemMobile = ({
	transaction,
	profile,
	containmentRef,
	onTransactionClick,
}: NotificationTransactionItemProperties) => {
	const { t } = useTranslation();
	const { getWalletAlias } = useWalletAlias();

	const { alias } = useMemo(
		() =>
			getWalletAlias({
				address: transaction.recipient(),
				network: transaction.wallet().network(),
				profile,
			}),
		[profile, getWalletAlias, transaction],
	);

	return (
		<VisibilitySensor scrollCheck delayedCall containment={containmentRef?.current}>
			<TableRow onClick={() => onTransactionClick?.(transaction)}>
				<td className="flex-col space-y-4 px-6 py-4" data-testid="NotificationTransactionItemMobile">
					<RowWrapper>
						<RowLabel>{t("COMMON.ADDRESS")}</RowLabel>
						<div className="w-2/3">
							<Address address={transaction.sender()} walletName={alias} />
						</div>
					</RowWrapper>

					<RowWrapper>
						<RowLabel>{t("COMMON.AMOUNT")}</RowLabel>
						<AmountLabel
							value={transaction.amount()}
							isNegative={transaction.isSent()}
							ticker={transaction.wallet().currency()}
						/>
					</RowWrapper>
				</td>
			</TableRow>
		</VisibilitySensor>
	);
};
