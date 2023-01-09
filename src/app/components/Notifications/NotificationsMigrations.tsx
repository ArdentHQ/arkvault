import React from "react";
import { NotificationsMigrationProperties } from "./Notifications.contracts";
import { MigrationTransactionItem } from "./MigrationTransactionItem";
import { Image } from "@/app/components/Image";
import { Table } from "@/app/components/Table";

export const NotificationsMigrations = ({ profile, transactions }: NotificationsMigrationProperties) => (
	<div className="-mx-10 items-center space-y-3 border-t border-white bg-theme-hint-50 px-5 pt-6 pb-4 text-theme-secondary-900 dark:border-theme-secondary-800 dark:bg-black dark:text-theme-secondary-200">
		<div className="flex justify-center">
			<Image name="MigrationNotificationHeader" useAccentColor={false} />
		</div>

		<div className="px-5">
			<Table className="w-full" hideHeader columns={[{ Header: "-", className: "hidden" }]} data={transactions}>
				{/* @TODO: assign a better type for the transaction once defined */}
				{(transaction: any) => (
					<MigrationTransactionItem transaction={transaction} profile={profile} onClick={() => {}} />
				)}
			</Table>
		</div>
	</div>
);
