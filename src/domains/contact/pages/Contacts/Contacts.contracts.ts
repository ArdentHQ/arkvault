import { Contracts } from "@/app/lib/profiles";

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
