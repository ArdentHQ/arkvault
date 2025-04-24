import { Networks } from "@/app/lib/sdk";
import { Contracts } from "@/app/lib/profiles";

export type UseDisplayWallets = () => {
	availableWallets: Contracts.IReadWriteWallet[];
	availableNetworks: Networks.Network[];
	walletsGroupedByNetwork: Map<Networks.Network, Contracts.IReadWriteWallet[]>;
	filteredWalletsGroupedByNetwork: Array<[Networks.Network, Contracts.IReadWriteWallet[]]>;
	hasWalletsMatchingOtherNetworks: boolean;
};
