import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Icon } from "@/app/components/Icon";
import { TableWrapper } from "@/app/components/Table/TableWrapper";
import cn from "classnames";
import { Divider } from "@/app/components/Divider";
import { LedgerMigrator } from "@/app/lib/mainsail/ledger.migrator";
import { TransactionTable } from "./TransactionTable";

export const Transactions = ({ migrator }: { migrator: LedgerMigrator }) => {
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false)

	return (
		<TableWrapper className="rounded-b-none! border-none" >
			<div
				className="cursor-pointer border-b-theme-secondary-300 dark:border-b-theme-secondary-800 dim:border-b-theme-dim-700 flex w-full flex-col items-start justify-between gap-3 border-b-0 pt-3 pb-4 sm:flex-row md:items-center md:border-b md:px-6 md:py-4"
				onClick={() => setIsOpen(!isOpen)}>
				<div className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-200 text-base leading-5 font-semibold">
					{t("COMMON.ADDRESSES")}
				</div>
				<div className="flex items-center">
					<div className="mr-1"><span className="font-semibold">1</span> out of 10</div>
					<Divider type="vertical" />
					<Icon name="ChevronDownSmall"
						className={cn("ml-1 transition-transform text-theme-secondary-500", { "rotate-180 transform": isOpen })}
						size="sm"
					/>
				</div>
			</div>

			{isOpen && (
				<TransactionTable transactions={migrator.transactions()} />
			)}
		</TableWrapper>
	);
};
