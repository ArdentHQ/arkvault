import { Contracts } from "@ardenthq/sdk-profiles";

export interface AddressTableProperties {
	wallets: Contracts.IReadWriteWallet[];
	onSelect?: (address: string, network: string) => void;
	isCompact?: boolean;
	profile: Contracts.IProfile;
}
