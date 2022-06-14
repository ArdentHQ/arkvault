import { Contracts } from "@ardenthq/sdk-profiles";

export interface ContactsHeaderProperties {
	showSearchBar: boolean;
	onAddContact: () => void;
	onSearch: (query: string) => void;
}

export interface ContactsHeaderExtraProperties {
	showSearchBar: boolean;
	onSearch?: (query: string) => void;
	onAddContact?: () => void;
}

export interface FilteredContactsProperties {
	profile: Contracts.IProfile;
	contacts: Contracts.IContact[];
	query: string;
}

export interface AvailableNetwork {
	id: string;
	hasBalance: boolean;
}
