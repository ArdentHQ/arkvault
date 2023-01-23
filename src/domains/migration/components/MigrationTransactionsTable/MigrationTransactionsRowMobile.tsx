import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { MigrationTransactionsRowStatusProperties } from "./MigrationTransactionsTable.contracts";
import { Icon } from "@/app/components/Icon";
import { TableRow } from "@/app/components/Table";
import { useTimeFormat } from "@/app/hooks/use-time-format";
import { RowWrapper, RowLabel, ResponsiveAddressWrapper } from "@/app/components/Table/Mobile/Row";
import { Address } from "@/app/components/Address";
import { AmountLabel } from "@/app/components/Amount";
import { Avatar, EthereumAvatar } from "@/app/components/Avatar";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { Link } from "@/app/components/Link";
import { MigrationTransaction, MigrationTransactionStatus } from "@/domains/migration/migration.contracts";
import { getIcon } from "@/domains/migration/utils";
import { Button } from "@/app/components/Button";
import { polygonTransactionLink } from "@/utils/polygon-migration";
import { MigrationTransactionsRowMobileSkeleton } from "@/domains/migration/components/MigrationTransactionsTable/MigrationTransactionsRowMobileSkeleton";

const MigrationTransactionsRowStatus: React.FC<MigrationTransactionsRowStatusProperties> = ({ status }) => {
	const { t } = useTranslation();

	const { name, color } = getIcon(status);

	return (
		<span className="flex items-center space-x-2 text-theme-secondary-700 dark:text-theme-secondary-200">
			<span>{t(`MIGRATION.STATUS.${status.toUpperCase()}`)}</span>
			<Icon name={name} size="lg" className={color} />
		</span>
	);
};

interface MigrationTransactionsRowMobileProperties {
	migrationTransaction: MigrationTransaction;
	isLoading: boolean;
	onClick: () => void;
}

export const MigrationTransactionsRowMobile: React.FC<MigrationTransactionsRowMobileProperties> = ({
	migrationTransaction: { transaction, status },
	isLoading,
	onClick,
}) => {
	const timeFormat = useTimeFormat();
	const { t } = useTranslation();

	const address = useMemo(() => (isLoading ? undefined : transaction.wallet().address()), [transaction, isLoading]);

	const migrationAddress = useMemo(
		() => (isLoading ? undefined : transaction.memo() || ""),
		[transaction, isLoading],
	);

	if (isLoading) {
		return <MigrationTransactionsRowMobileSkeleton />;
	}

	return (
		<TableRow data-testid="MigrationTransactionsRowMobile" onClick={onClick}>
			<td className="flex-col space-y-4 py-4">
				<RowWrapper>
					<RowLabel>{t("COMMON.ID")}</RowLabel>

					{status === MigrationTransactionStatus.Confirmed ? (
						<Link
							to={polygonTransactionLink(transaction.id())}
							tooltip={transaction.id()}
							showExternalIcon={false}
							isExternal
						>
							<TruncateMiddle text={transaction.id()} />
						</Link>
					) : (
						<span className="text-theme-secondary-700 dark:text-theme-secondary-200">NA</span>
					)}
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.TIMESTAMP")}</RowLabel>

					{transaction.timestamp()?.format(timeFormat)}
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.ADDRESS")}</RowLabel>

					<ResponsiveAddressWrapper innerClassName="gap-2">
						<div className="w-0 flex-1">
							<Address address={address} alignment="right" />
						</div>

						<Avatar size="xs" address={address} noShadow />
					</ResponsiveAddressWrapper>
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.MIGRATION_ADDRESS")}</RowLabel>

					<ResponsiveAddressWrapper innerClassName="gap-2">
						<div className="w-0 flex-1">
							<Address address={migrationAddress} alignment="right" />
						</div>

						<EthereumAvatar address={migrationAddress} size="xs" />
					</ResponsiveAddressWrapper>
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.AMOUNT")}</RowLabel>

					<AmountLabel value={migrationTransaction.amount} ticker="ARK" isCompact isNegative />
				</RowWrapper>

				<RowWrapper>
					<RowLabel>{t("COMMON.STATUS")}</RowLabel>

					<MigrationTransactionsRowStatus status={status} />
				</RowWrapper>

				<RowWrapper>
					<Button className="w-full sm:ml-auto sm:w-auto" variant="secondary" onClick={onClick}>
						{t("MIGRATION.PAGE_MIGRATION.VIEW_DETAILS")}
					</Button>
				</RowWrapper>
			</td>
		</TableRow>
	);
};
