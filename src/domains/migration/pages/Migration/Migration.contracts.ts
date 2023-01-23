export interface MigrationHeaderProperties {
	onNewMigration: () => void;
	contractIsPaused?: boolean;
}

export interface MigrationHeaderExtraProperties {
	onNewMigration?: () => void;
	contractIsPaused?: boolean;
}

export interface MigrationNewMigrationMobileButtonProperties {
	onNewMigration?: () => void;
	contractIsPaused?: boolean;
}
