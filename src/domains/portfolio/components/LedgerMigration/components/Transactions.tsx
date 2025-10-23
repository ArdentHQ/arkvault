import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Icon } from "@/app/components/Icon";
import cn from "classnames";
import { Divider } from "@/app/components/Divider";
import { LedgerMigrator } from "@/app/lib/mainsail/ledger.migrator";
import { TransactionTable } from "./TransactionTable";
import { useBreakpoint } from "@/app/hooks";
import { DetailLabel } from "@/app/components/DetailWrapper";
import { TransactionRowMobile } from "./TransactionRowMobile";

export const Transactions = ({ migrator }: { migrator: LedgerMigrator }) => {
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const { isXs } = useBreakpoint();

	if (isXs) {
		return (
			<div className="space-y-2">
				<DetailLabel>
					<div className="flex items-center justify-between" onClick={() => setIsOpen(!isOpen)}>
						<span>{t("COMMON.ADDRESSES")}</span>
						<div className="flex items-center">
							<div className="mr-1">
								<span className="font-semibold">1</span> out of 10
							</div>
							<Divider type="vertical" />
							<Icon
								name="ChevronDownSmall"
								className={cn("text-theme-secondary-500 ml-1 transition-transform", {
									"rotate-180 transform": isOpen,
								})}
								size="sm"
							/>
						</div>
					</div>
				</DetailLabel>

				{isOpen && (
					<div className="p-3">
						{migrator.transactions().map((transaction, index) => (
							<TransactionRowMobile transaction={transaction} key={index} />
						))}
					</div>
				)}
			</div>
		);
	}

	return (
		<div
			className={cn(
				"outline-theme-secondary-300 dark:border-theme-secondary-800 dark:outline-theme-secondary-800 dim:border-theme-dim-700 dim:outline-theme-dim-700 rounded-xl outline outline-1",
				{
					"pb-2": isOpen,
				},
			)}
		>
			<div
				className={cn(
					"border-b-theme-secondary-300 dark:border-b-theme-secondary-800 dim:border-b-theme-dim-700 flex w-full cursor-pointer items-center justify-between gap-3 px-6 py-4 pt-3 pb-4",
					{
						"border-b": isOpen,
					},
				)}
				onClick={() => setIsOpen(!isOpen)}
			>
				<div className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-200 text-base leading-5 font-semibold">
					{t("COMMON.ADDRESSES")}
				</div>
				<div className="flex items-center">
					<div className="mr-1">
						<span className="font-semibold">1</span> out of 10
					</div>
					<Divider type="vertical" />
					<Icon
						name="ChevronDownSmall"
						className={cn("text-theme-secondary-500 ml-1 transition-transform", {
							"rotate-180 transform": isOpen,
						})}
						size="sm"
					/>
				</div>
			</div>

			{isOpen && <TransactionTable transactions={migrator.transactions()} />}
		</div>
	);
};
