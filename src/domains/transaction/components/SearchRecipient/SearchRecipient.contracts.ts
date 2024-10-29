import { Contracts } from "@ardenthq/sdk-profiles";

export interface RecipientProperties {
	id: string;
	address: string;
	alias?: string;
	network?: string;
	avatar: string;
	type: string;
}

export interface SearchRecipientListItemProperties {
	index: number;
	recipient: RecipientProperties;
	onAction: (address: string) => void;
	selectedAddress?: string;
}
export interface SearchRecipientListItemResponsiveProperties {
	index: number;
	recipient: RecipientProperties;
	onAction: (address: string) => void;
	selectedAddress?: string;
}

export interface SearchRecipientProperties {
	title?: string;
	description?: string;
	isOpen: boolean;
	onClose?: () => void;
	onAction: (address: string) => void;
	recipients: RecipientProperties[];
	selectedAddress?: string;
	profile: Contracts.IProfile;
}
