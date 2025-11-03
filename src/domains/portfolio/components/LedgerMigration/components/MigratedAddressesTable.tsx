import React, { ReactElement, useState } from "react";
import { Column } from "react-table";

import { Table } from "@/app/components/Table";
import { useTranslation } from "react-i18next";
import { MigratedAddressRow } from "./MigratedAddressRow";
import { UpdateWalletName } from "@/domains/wallet/components/UpdateWalletName";
import { Contracts } from "@/app/lib/profiles";
import { MigrationTransaction } from "@/app/lib/mainsail/ledger.migrator";
import { MigratedAddressRowMobile } from "./MigratedAddressRowMobile";

export const MigratedAddressesTable = ({
	profile,
	transactions,
}: {
	profile: Contracts.IProfile;
	transactions: MigrationTransaction[];
}): ReactElement => {
	const { t } = useTranslation();
	const [editingWallet, setEditingWallet] = useState<Contracts.IReadWriteWallet | undefined>(undefined);

	const columns: Column<DataTransfer>[] = [
		{
			Header: t("COMMON.ADDRESS"),
			cellWidth: "w-full",
			headerClassName: "no-border whitespace-nowrap",
			noRoundedBorders: true,
		},
		{
			Header: t("COMMON.EDIT_NAME"),
			className: "justify-end",
			disableSortBy: true,
			headerClassName: "no-border whitespace-nowrap",
			noRoundedBorders: true,
		},
	];

	return (
		<div className="relative" data-testid="MigratedAddressesTable">
			<div className="block sm:hidden">
				{transactions.map((transaction, index) => (
					<MigratedAddressRowMobile transaction={transaction} key={index} profile={profile} />
				))}
			</div>
			<div className="md:border-theme-secondary-300 dark:md:border-theme-secondary-800 dim:md:border-theme-dim-700 relative hidden overflow-hidden rounded-xl border border-transparent sm:block">
				<Table columns={columns} data={transactions}>
					{(transaction: MigrationTransaction) => (
						<MigratedAddressRow
							transaction={transaction}
							onEdit={() => setEditingWallet(transaction.recipient())}
						/>
					)}
				</Table>

				{editingWallet && (
					<UpdateWalletName
						wallet={editingWallet}
						profile={profile}
						onCancel={() => setEditingWallet(undefined)}
						onAfterSave={() => setEditingWallet(undefined)}
					/>
				)}
			</div>
		</div>
	);
};
