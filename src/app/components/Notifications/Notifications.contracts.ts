import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { Migration } from "@/domains/migration/migration.contracts";

export interface Action {
	label: string;
	value: string;
}

export interface NotificationItemProperties {
	id: string;
	body: string;
	name: string;
	action?: string;
	icon: string;
	image?: string;
	onAction?: (id: string) => void;
	onVisibilityChange?: (isVisible: boolean) => void;
	containmentRef?: any;
	meta?: Record<string, any>;
}

export interface NotificationTransactionItemProperties {
	transaction: DTO.ExtendedConfirmedTransactionData;
	profile: Contracts.IProfile;
	containmentRef?: any;
	onVisibilityChange?: (isVisible: boolean) => void;
	onTransactionClick?: (item?: DTO.ExtendedConfirmedTransactionData) => void;
}

export interface NotificationsProperties {
	profile: Contracts.IProfile;
	onNotificationAction?: (id: string) => void;
	onTransactionClick?: (item?: DTO.ExtendedConfirmedTransactionData) => void;
}

export interface NotificationsMigrationItemProperties {
	transaction: any;
	profile: Contracts.IProfile;
	onClick?: (transaction: Migration) => void;
	containmentRef?: any;
	onVisibilityChange: (isVisible: boolean) => void;
}

export interface NotificationsMigrationItemPropertiesMobile {
	transaction: Migration;
	onClick?: (transaction: Migration) => void;
	alias?: string;
	containmentRef?: any;
	onVisibilityChange: (isVisible: boolean) => void;
}

export interface NotificationsMigrationProperties {
	profile: Contracts.IProfile;
	// @TODO: assign a proper type for this once defined
	transactions: Migration[];
	onVisibilityChange: (migration: Migration, isVisible: boolean) => void;
}
