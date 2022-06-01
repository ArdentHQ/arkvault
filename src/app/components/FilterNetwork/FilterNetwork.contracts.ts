import { Networks } from "@payvo/sdk";

export interface ToggleAllOptionProperties {
	onClick?: any;
	isHidden?: boolean;
	isSelected?: boolean;
}

export interface FilterOption {
	network: Networks.Network;
	isSelected: boolean;
	onClick?: any;
}

export interface FilterNetworksProperties {
	title?: string;
	options?: FilterOption[];
	onChange?: (network: FilterOption, networks: FilterOption[]) => void;
	onViewAll?: any;
	hideViewAll?: boolean;
	className?: string;
}
