import React, { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { TableCell, TableRow } from "@/app/components/Table";
import { Link } from "@/app/components/Link";
import { Address } from "@/app/components/Address";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { Divider } from "@/app/components/Divider";
import { Amount } from "@/app/components/Amount";
import { MigrationTransaction } from "@/app/lib/mainsail/ledger.migrator";

export const MigratedAddressRow = ({
	transaction,
	onEdit,
}: {
	onEdit?: () => void;
	transaction: MigrationTransaction;
}): ReactElement => {
	const { t } = useTranslation();
	return (
		<TableRow data-testid="MigratedAddressRow">
			<TableCell
				variant="start"
				innerClassName="h-full dim:group-hover:bg-transparent dark:group-hover:bg-transparent group-hover:bg-transparent"
			>
				<div className="max-w-64 py-2">
					<div>
						<Address
							address={transaction.recipient()?.address()}
							walletName={transaction.recipient()?.alias()}
							showCopyButton
							data-testid="MigratedAddressRow_address"
							addressClass="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 text-sm leading-[17px]"
						/>
						<div className="mt-1 flex items-center">
							<Link to={transaction.signedTransaction()?.explorerLink()!} isExternal>
								{t("COMMON.TX_ID")}
							</Link>
							<Divider type="vertical" />
							<Amount
								ticker={transaction.network().ticker()}
								value={transaction.amount()}
								className="text-theme-primary-600 dark:text-theme-secondary-500 dim:text-theme-dim-500 font-semibold"
							/>
						</div>
					</div>
				</div>
			</TableCell>

			<TableCell
				variant="end"
				innerClassName="h-full dim:group-hover:bg-transparent dark:group-hover:bg-transparent group-hover:bg-transparent pr-0"
			>
				<div className="flex h-full items-start">
					<Button
						data-testid="MigratedAddressRow_edit-button"
						variant="transparent"
						onClick={onEdit}
						className="text-theme-primary-600 dark:text-theme-secondary-500 dim:text-theme-dim-500 pr-3!"
					>
						<Icon name="Pencil" />
						<span>{t("COMMON.EDIT")}</span>
					</Button>
				</div>
			</TableCell>
		</TableRow>
	);
};
