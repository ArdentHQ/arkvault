import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import tw, { css } from "twin.macro";
import { NotificationsMigrationItemProperties } from "./Notifications.contracts";
import { MigrationTransactionItemMobile } from "./MigrationTransactionItemMobile";
import { TableCell, TableRow } from "@/app/components/Table";
import { useWalletAlias, useBreakpoint } from "@/app/hooks";
import { Icon } from "@/app/components/Icon";
import { Address } from "@/app/components/Address";
import { Avatar } from "@/app/components/Avatar";

const rowStyles = [
	css`
		&:hover td > div {
			${tw`bg-theme-hint-100 dark:bg-theme-secondary-900`}
		}
	`,
];

export const MigrationTransactionItem = ({ transaction, profile, onClick }: NotificationsMigrationItemProperties) => {
	const { t } = useTranslation();
	const { getWalletAlias } = useWalletAlias();
	const { isXs, isSm } = useBreakpoint();

	const wallet = useMemo(
		() => profile.wallets().findByAddressWithNetwork(transaction.address, "ark.mainnet"),
		[profile],
	);

	const { alias } = useMemo(() => {
		if (wallet === undefined) {
			return { alias: undefined };
		}

		return getWalletAlias({
			address: wallet.address(),
			network: wallet ? wallet.network() : undefined,
			profile,
		});
	}, [profile, transaction, wallet]);

	if (isXs || isSm) {
		return <MigrationTransactionItemMobile transaction={transaction} alias={alias} onClick={onClick} />;
	}

	return (
		<TableRow data-testid="" className="group" styles={rowStyles} onClick={() => onClick?.(transaction)}>
			<TableCell variant="start" className="w-3/5" innerClassName="flex space-x-3" isCompact>
				<div className="flex flex-1 items-center space-x-3 overflow-auto">
					<Icon name="CircleCheckMark" size="lg" className="text-theme-hint-600" />

					<Avatar size="xs" address={transaction.address} noShadow />

					<div className="w-20 flex-1">
						<Address
							address={transaction.address}
							walletName={alias}
							addressClass="text-theme-hint-300 dark:text-theme-secondary-700"
						/>
					</div>
				</div>
			</TableCell>

			<TableCell variant="end" innerClassName="justify-end" isCompact>
				<button
					data-testid="MigrationTransactionItem__button"
					type="button"
					className="flex items-center space-x-3 text-theme-navy-600 hover:text-theme-navy-700"
				>
					<span className="whitespace-nowrap font-semibold">
						{t("MIGRATION.NOTIFICATIONS.MIGRATION_SUCCESSFUL")}
					</span>

					<Icon name="ChevronRightSmall" size="sm" />
				</button>
			</TableCell>
		</TableRow>
	);
};
