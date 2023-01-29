import React from "react";
import { useHistory , generatePath } from "react-router-dom";
import { NotificationsMigrationProperties } from "./Notifications.contracts";
import { MigrationTransactionItem } from "./MigrationTransactionItem";
import { Image } from "@/app/components/Image";
import { Table } from "@/app/components/Table";
import { Migration } from "@/domains/migration/migration.contracts";
import { ProfilePaths } from "@/router/paths";

export const NotificationsMigrations = ({
	profile,
	transactions,
	onVisibilityChange,
}: NotificationsMigrationProperties) => {
	const history = useHistory();

	return (
		<div
			data-testid="NotificationsMigrations"
			className="-mx-10 -mt-5 mb-4 items-center border-white bg-theme-hint-50 px-5 pt-6 pb-4 text-theme-secondary-900 dark:border-theme-secondary-800 dark:bg-black dark:text-theme-secondary-200 md:mb-0 md:mt-0 md:space-y-3 md:border-t"
		>
			<div className="mx-auto hidden w-56 justify-center md:flex">
				<Image name="MigrationSuccessBanner" domain="migration" useAccentColor={false} />
			</div>

			<div className="px-5">
				<Table
					className="w-full"
					hideHeader
					columns={[{ Header: "-", className: "hidden" }]}
					data={transactions}
				>
					{(transaction: Migration) => (
						<MigrationTransactionItem
							transaction={transaction}
							profile={profile}
							onClick={(migrationTransaction) => {
								history.push(
									generatePath(ProfilePaths.MigrationOverview, {
										migrationId: migrationTransaction.id,
										profileId: profile.id(),
									}),
								);
							}}
							onVisibilityChange={(isVisible) => onVisibilityChange(transaction, isVisible)}
						/>
					)}
				</Table>
			</div>
		</div>
	);
};
