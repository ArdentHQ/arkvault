import React from "react";

import { NotificationsMigrationProperties } from "./Notifications.contracts";
import { Image } from "@/app/components/Image";
export const NotificationsMigrations = ({ profile, transactions }: NotificationsMigrationProperties) => (
	// @TODO: since the purple used on the backgroud is more likely added on other steps of the migration feature
	// is possible that we need to add a new set of colors, in that case update the bg class <here></here>
	<div className="-mx-10  flex flex-col items-center border-t border-white bg-[#F5F5FF] px-5 py-6 text-theme-secondary-900 dark:border-theme-secondary-800 dark:bg-black dark:text-theme-secondary-200">
		<div>
			<Image name="MigrationNotificationHeader" useAccentColor={false} />
		</div>
		<div>
			Lorem ipsum dolor sit amet consectetur adipisicing elit. Laudantium necessitatibus, earum odit tempora
			officia saepe officiis quidem accusamus fuga quas, dolorum praesentium nisi eveniet, quod iure dignissimos
			voluptate soluta hic.
		</div>
	</div>
);
