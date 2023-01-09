import { Contracts, DTO } from "@ardenthq/sdk-profiles";

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
	// @TODO: assign a proper type for this once defined
	transaction: any;
	profile: Contracts.IProfile;
	// @TBD (also @TODO set transaction type)
	onClick?: (transaction: any) => void;
}

export interface NotificationsMigrationItemPropertiesMobile {
	// @TODO: assign a proper type for this once defined
	transaction: any;
	// @TBD (also @TODO set transaction type)
	onClick?: (transaction: any) => void;
	alias?: string;
}

export interface NotificationsMigrationProperties {
	profile: Contracts.IProfile;
	// @TODO: assign a proper type for this once defined
	transactions: any[];
}
