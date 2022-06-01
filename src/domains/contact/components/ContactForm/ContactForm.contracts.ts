import { Networks } from "@payvo/sdk";
import { Contracts } from "@payvo/sdk-profiles";

interface AddressItem {
	address: string;
	coin: string;
	name: string;
	network: string;
}

interface AddressListItemProperties {
	address: AddressItem;
	onRemove: () => void;
}

interface NetworkOption {
	label: string;
	value: string;
	isTestNetwork?: boolean;
}

interface AddressListProperties {
	addresses: AddressItem[];
	onRemove: (address: AddressItem) => void;
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
	addresses: AddressItem[];
	name: string;
}

interface ContactFormState {
	network: Networks.Network;
	name: string;
	address: string;
}

export type {
	AddressItem,
	AddressListItemProperties,
	AddressListProperties,
	ContactFormData,
	ContactFormProperties,
	ContactFormState,
	NetworkOption,
};
