import { Contracts } from "@ardenthq/sdk-profiles";
import { AvailableNetwork } from "@/domains/contact/pages/Contacts";

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
	availableNetworks: AvailableNetwork[];
}

export interface ContactListItemAddressProperties extends ContactListItemProperties {
	index: number;
	isLast: boolean;
	address: Contracts.IContactAddress;
}
