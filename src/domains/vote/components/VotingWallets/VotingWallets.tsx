import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { AddressTable } from "@/domains/vote/components/AddressTable";
import { Networks } from "@ardenthq/sdk";
interface VotingWalletsProperties {
	showEmptyResults: boolean;
	wallets: Contracts.IReadWriteWallet[];
	onSelectAddress: (address: string) => void;
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	network: Networks.Network;
}

export const VotingWallets = ({
	showEmptyResults,
	wallets,
	onSelectAddress,
	searchQuery,
	setSearchQuery,
	network,
}: VotingWalletsProperties) => (
	<AddressTable
		network={network}
		wallets={wallets}
		onSelect={onSelectAddress}
		searchQuery={searchQuery}
		setSearchQuery={setSearchQuery}
		showEmptyResults={showEmptyResults}
	/>
);
