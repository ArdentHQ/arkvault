import React from "react";
import { NotificationsMigrationProperties } from "./Notifications.contracts";
import { MigrationTransactionItem } from "./MigrationTransactionItem";
import { Image } from "@/app/components/Image";
import { Table } from "@/app/components/Table";
import { Migration } from "@/domains/migration/migration.contracts";

export const NotificationsMigrations = ({
	profile,
	transactions,
	onVisibilityChange,
}: NotificationsMigrationProperties) => (
	<div
		data-testid="NotificationsMigrations"
		className="-mx-10 -mt-5 mb-4 items-center border-white bg-theme-hint-50 px-5 pt-6 pb-4 text-theme-secondary-900 dark:border-theme-secondary-800 dark:bg-black dark:text-theme-secondary-200 md:mb-0 md:mt-0 md:space-y-3 md:border-t"
	>
		<div className="mx-auto hidden w-56 justify-center md:flex">
			<Image name="MigrationSuccessBanner" domain="migration" useAccentColor={false} />
		</div>

		<div className="px-5">
			<Table className="w-full" hideHeader columns={[{ Header: "-", className: "hidden" }]} data={transactions}>
				{(transaction: Migration) => (
					<MigrationTransactionItem
						transaction={transaction}
						profile={profile}
						onClick={() => {}}
						onVisibilityChange={(isVisible) => onVisibilityChange(transaction, isVisible)}
					/>
				)}
			</Table>
		</div>
	</div>
);
