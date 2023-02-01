import { MigrationTransactionStatus } from "@/domains/migration/migration.contracts";

export const getIcon = (status: MigrationTransactionStatus | undefined) => {
	if (status === undefined) {
		return {
			color: "text-theme-hint-600",
			name: "CircleQuestionMark",
		};
	}

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
