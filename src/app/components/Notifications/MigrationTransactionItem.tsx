import React, { useMemo } from "react";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { NotificationsMigrationItemProperties } from "./Notifications.contracts";
// import { NotificationTransactionItemMobile } from "./NotificationTransactionItemMobile";
import { TableCell, TableRow } from "@/app/components/Table";
import { useWalletAlias } from "@/app/hooks";
import { Icon } from "@/app/components/Icon";
import { Address } from "@/app/components/Address";
import tw, { css } from "twin.macro";
// address: "AXzxJ8Ts3dQ2bvBR1tPE7GUee9iSEJb8HX",
// 		amount: 123,
// 		id: "id",
// 		migrationAddress: "0x0000000000000000000000000000000000000000",
// 		status: MigrationTransactionStatus.Confirmed,
// 		timestamp: Date.now() / 1000,

export const MigrationTransactionItem = ({ transaction, profile, onClick }: NotificationsMigrationItemProperties) => {
	const { t } = useTranslation();
	const { getWalletAlias } = useWalletAlias();
	// const { isXs, isSm } = useBreakpoint();
	//

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

	// if (isXs || isSm) {
	// 	return (
	// 		<NotificationTransactionItemMobile
	// 			isCompact
	// 			transaction={transaction}
	// 			profile={profile}
	// 			containmentRef={containmentRef?.current}
	// 			onTransactionClick={() => onTransactionClick?.(transaction)}
	// 		/>
	// 	);
	// }
	//
	// address: "AXzxJ8Ts3dQ2bvBR1tPE7GUee9iSEJb8HX",
	// 	amount: 123,
	// 	id: "id",
	// 	migrationAddress: "0x0000000000000000000000000000000000000000",
	// 	status: MigrationTransactionStatus.Confirmed,
	// 	timestamp: Date.now() / 1000,
	//
	const rowStyles = [
		css`
			&:hover td > div {
				${tw`bg-theme-hint-100 dark:bg-theme-secondary-900`}
			}
		`,
	];

	return (
		<TableRow className="group" styles={rowStyles} onClick={() => onClick?.(transaction)}>
			<TableCell variant="start" className="w-3/5" innerClassName="flex space-x-3" isCompact>
				<div className="flex flex-1 items-center space-x-3 overflow-auto">
					<div data-testid="TransactionRowMode" className="flex items-center -space-x-1">
						<span className={cn("flex h-5 w-5 items-center border-0", "text-theme-hint-600")}>
							<Icon name="CircleCheckMark" size="lg" />
						</span>
					</div>

					<div className="w-20 flex-1">
						<Address
							address={transaction.address}
							walletName={alias}
							addressClass="text-theme-hint-300 dark:text-theme-secondary-200"
						/>
					</div>
				</div>
			</TableCell>

			<TableCell variant="end" innerClassName="justify-end" isCompact>
				<button
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
