import React from "react";
import { useTranslation } from "react-i18next";
import { NotificationsMigrationItemPropertiesMobile } from "./Notifications.contracts";
import { Address } from "@/app/components/Address";
import { RowWrapper, RowLabel } from "@/app/components/Table/Mobile/Row";
import { TableRow } from "@/app/components/Table";
import { Avatar } from "@/app/components/Avatar";
import { Icon } from "@/app/components/Icon";
export const MigrationTransactionItemMobile = ({
	transaction,
	onClick,
	alias,
}: NotificationsMigrationItemPropertiesMobile) => {
	const { t } = useTranslation();
	return (
		<TableRow onClick={() => onClick?.(transaction)}>
			<td className="flex-col space-y-4 py-4 text-sm">
				<RowWrapper>
					<RowLabel>{t("COMMON.SENDER")}</RowLabel>
					<div className="flex w-full items-center space-x-0 text-right">
						<div className="w-0 flex-1 pr-2">
							<Address
								address={transaction.address}
								walletName={alias}
								addressClass="text-theme-hint-300 dark:text-theme-secondary-700"
								alignment="right"
								size="sm"
							/>
						</div>

						<Avatar size="xs" address={transaction.address} noShadow />
					</div>
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.TYPE")}</RowLabel>

					<div className="flex items-center space-x-3">
						<button
							type="button"
							className="flex items-center space-x-3 text-theme-navy-600 hover:text-theme-navy-700"
						>
							<span className="whitespace-nowrap font-semibold">
								{t("MIGRATION.NOTIFICATIONS.MIGRATION_SUCCESSFUL")}
							</span>

							<Icon name="ChevronRightSmall" size="sm" />
						</button>

						<Icon name="CircleCheckMark" size="lg" className="text-theme-hint-600" />
					</div>
				</RowWrapper>
			</td>
		</TableRow>
	);
};
