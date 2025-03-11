import { Contracts } from "@ardenthq/sdk-profiles";

interface AddressItem {
	address: string;
	coin: string;
	name: string;
}

interface NetworkOption {
	label: string;
	value: string;
	isTestNetwork?: boolean;
}

interface ContactFormProperties {
	contact?: Contracts.IContact;
	profile: Contracts.IProfile;
	onCancel: () => void;
	onChange: (fieldName: keyof ContactFormState) => void;
	onDelete?: () => void;
	onSave: (data: ContactFormData) => void;
	errors: Partial<Record<keyof ContactFormState, string>>;
}

interface ContactFormData {
	address: AddressItem;
	name: string;
}

interface ContactFormState {
	name: string;
	address: string;
}

export type { AddressItem, ContactFormData, ContactFormProperties, ContactFormState, NetworkOption };
