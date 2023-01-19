import { MigrationTransactionStatus } from "@/domains/migration/migration.contracts";

export const getIcon = (status: MigrationTransactionStatus) => {
	if (status === MigrationTransactionStatus.Confirmed) {
		return {
			color: "text-theme-success-600",
			name: "CircleCheckMark",
		};
	}

	return {
		color: "text-theme-warning-300",
		name: "Clock",
	};
};
