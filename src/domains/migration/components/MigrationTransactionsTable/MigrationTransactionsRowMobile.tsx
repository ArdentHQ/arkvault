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
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { Link } from "@/app/components/Link";

import {
	MigrationTransactionsRowStatusProperties,
	MigrationTransactionStatus,
} from "./MigrationTransactionsTable.contracts";

const MigrationTransactionsRowStatus: React.FC<MigrationTransactionsRowStatusProperties> = ({ status }) => {
	const { t } = useTranslation();

	const getIcon = (status: MigrationTransactionStatus) => {
		if (status === MigrationTransactionStatus.Confirmed) {
			return {
				color: "text-theme-success-600",
				name: "CircleCheckMark",
			};
		}

		return {
			color: "text-theme-secondary-500 dark:text-theme-secondary-700",
			name: "Clock",
		};
	};

	const { name, color } = getIcon(status);

	return (
		<span className="flex items-center space-x-2 text-theme-secondary-700 dark:text-theme-secondary-200">
			<span>{t(`MIGRATION.STATUS.${status.toUpperCase()}`)}</span>
			<Icon name={name} size="lg" className={color} />
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

					{migrationTransaction.status === MigrationTransactionStatus.Confirmed ? (
						<Link
							to={`https://polygonscan.com/tx/${migrationTransaction.id}`}
							tooltip={migrationTransaction.id}
							showExternalIcon={false}
							isExternal
						>
							<TruncateMiddle text={migrationTransaction.id} />
						</Link>
					) : (
						<span className="text-theme-secondary-700 dark:text-theme-secondary-200">NA</span>
					)}
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.TIMESTAMP")}</RowLabel>

					{DateTime.fromUnix(migrationTransaction.timestamp).format(timeFormat)}
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.ADDRESS")}</RowLabel>

					<ResponsiveAddressWrapper innerClassName="gap-2">
						<div className="w-0 flex-1">
							<Address address={migrationTransaction.address} alignment="right" />
						</div>

						<Avatar size="xs" address={migrationTransaction.address} noShadow />
					</ResponsiveAddressWrapper>
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.MIGRATION_ADDRESS")}</RowLabel>

					<ResponsiveAddressWrapper innerClassName="gap-2">
						<div className="w-0 flex-1">
							<Address address={migrationTransaction.migrationAddress} alignment="right" />
						</div>

						<EthereumAvatar address={migrationTransaction.migrationAddress} size="xs" />
					</ResponsiveAddressWrapper>
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.STATUS")}</RowLabel>

					<MigrationTransactionsRowStatus status={migrationTransaction.status} />
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.AMOUNT")}</RowLabel>

					<AmountLabel value={migrationTransaction.amount} ticker="ARK" isCompact isNegative />
				</RowWrapper>
			</td>
		</TableRow>
	);
};
