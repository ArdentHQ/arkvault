import { MigrationTransactionStatus } from "@/domains/migration/migration.contracts";

export const getIcon = (status: MigrationTransactionStatus) => {
	if (status === MigrationTransactionStatus.Confirmed) {
		return {
			color: "text-theme-success-600",
			name: "CircleCheckMark",
		};
	}

	return {
		color: "text-theme-secondary-500 dark:text-theme-secondary-700",
		name: "Clock",
	};
};
