import { DateTime } from "@ardenthq/sdk-intl";
import React from "react";
import { useTranslation } from "react-i18next";

import { Icon } from "@/app/components/Icon";
import { TableRow } from "@/app/components/Table";
import { useTimeFormat } from "@/app/hooks/use-time-format";
import { RowWrapper, RowLabel, ResponsiveAddressWrapper } from "@/app/components/Table/Mobile/Row";
import { Address } from "@/app/components/Address";
import { AmountLabel } from "@/app/components/Amount";
import { Avatar, EthereumAvatar } from "@/app/components/Avatar";

const MigrationTransactionsRowStatus: React.FC<{ status: any }> = ({ status }) => {
	return (
		<span className="flex items-center space-x-2 text-theme-secondary-700 dark:text-theme-secondary-200">
			<span>confirmed</span>
			<Icon name="CircleCheckMark" size="lg" className="text-theme-success-600" />
		</span>
	);
};

interface MigrationTransactionsRowMobileProperties {
	migrationTransaction: any;
	onClick: () => void;
}

export const MigrationTransactionsRowMobile: React.FC<MigrationTransactionsRowMobileProperties> = ({
	migrationTransaction,
	onClick,
}) => {
	const timeFormat = useTimeFormat();

	const { t } = useTranslation();

	return (
		<TableRow onClick={onClick}>
			<td data-testid="TableRow__mobile" className="flex-col space-y-4 py-4">
				<RowWrapper>
					<RowLabel>{t("COMMON.ID")}</RowLabel>
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.TIMESTAMP")}</RowLabel>

					{DateTime.fromUnix(Date.now() / 1000).format(timeFormat)}
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.SENDER")}</RowLabel>

					<ResponsiveAddressWrapper innerClassName="gap-2">
						<div className="w-0 flex-1">
							<Address address="address" alignment="right" />
						</div>

						<Avatar size="xs" address="address" noShadow />
					</ResponsiveAddressWrapper>
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.MIGRATION_ADDRESS")}</RowLabel>

					<ResponsiveAddressWrapper innerClassName="gap-2">
						<div className="w-0 flex-1">
							<Address address="address" alignment="right" />
						</div>

						<EthereumAvatar address="address" size="xs" />
					</ResponsiveAddressWrapper>
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.STATUS")}</RowLabel>

					<MigrationTransactionsRowStatus status={undefined} />
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.AMOUNT")}</RowLabel>

					<AmountLabel value={1} ticker="ARK" isCompact isNegative />
				</RowWrapper>
			</td>
		</TableRow>
	);
};
