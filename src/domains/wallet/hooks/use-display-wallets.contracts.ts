import { Networks } from "@payvo/sdk";
import { Contracts } from "@payvo/sdk-profiles";

export type UseDisplayWallets = () => {
	availableWallets: Contracts.IReadWriteWallet[];
	availableNetworks: Networks.Network[];
	walletsGroupedByNetwork: Map<Networks.Network, Contracts.IReadWriteWallet[]>;
	filteredWalletsGroupedByNetwork: Array<[Networks.Network, Contracts.IReadWriteWallet[]]>;
	hasWalletsMatchingOtherNetworks: boolean;
};
