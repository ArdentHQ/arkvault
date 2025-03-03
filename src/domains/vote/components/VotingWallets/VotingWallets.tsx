import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";
import { EmptyResults } from "@/app/components/EmptyResults";
import { AddressTable } from "@/domains/vote/components/AddressTable";
import { Section } from "@/app/components/Layout";
import { profileAllEnabledNetworks } from "@/utils/network-utils";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
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
}: VotingWalletsProperties) => {
	return (
		<AddressTable
			network={network}
			wallets={wallets}
			onSelect={onSelectAddress}
			searchQuery={searchQuery}
			setSearchQuery={setSearchQuery}
			showEmptyResults={showEmptyResults}
		/>
	);
};
