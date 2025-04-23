import { Contracts } from "@/app/lib/profiles";
import { Networks } from "@ardenthq/sdk";
export interface AddressTableProperties {
	wallets: Contracts.IReadWriteWallet[];
	onSelect?: (address: string) => void;
	isCompact?: boolean;
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	showEmptyResults?: boolean;
	network: Networks.Network;
}
