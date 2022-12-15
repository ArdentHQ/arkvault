import React from "react";

import { Header } from "@/app/components/Header";

interface Properties {
	title: string;
	description: string;
	children: React.ReactNode;
}

export const MigrationStep = ({ title, description, children }: Properties) => (
	<div>
		<div className="px-10">
			<Header title={title} subtitle={description} />
		</div>

		<div className="mt-8 rounded-2.5xl border border-theme-secondary-300 p-5 dark:border-theme-secondary-800">
			{children}
		</div>
	</div>
);
