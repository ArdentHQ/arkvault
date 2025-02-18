import { Contracts } from "@ardenthq/sdk-profiles";

export interface ContactListItemOption {
	label: string;
	value: string | number;
}

export interface ContactListItemProperties {
	profile: Contracts.IProfile;
	item: Contracts.IContact;
	options: ContactListItemOption[];
	onAction: (action: ContactListItemOption) => void;
	onSend: (address: Contracts.IContactAddress) => void;
	hasBalance: boolean;
}

export interface ContactListItemAddressProperties extends ContactListItemProperties {
	index: number;
	isLast: boolean;
	address: Contracts.IContactAddress;
}
