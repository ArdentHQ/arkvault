import { Contracts } from "@/app/lib/profiles";

export interface RecipientProperties {
	id: string;
	address: string;
	alias?: string;
	network?: string;
	type: string;
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
