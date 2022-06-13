import { Networks } from "@payvo/sdk";
import { Size } from "@/types";

export interface NetworkOptionProperties {
	disabled?: boolean;
	network: Networks.Network;
	as?: React.ElementType;
	iconSize?: Size;
	onSelect?: () => void;
	onDeselect?: () => void;
	isSelected?: boolean;
}

export interface NetworkOptionsProperties {
	disabled?: boolean;
	name?: string;
	networks: Networks.Network[];
	onSelect?: (network?: Networks.Network | null) => void;
	selected?: Networks.Network;
}
