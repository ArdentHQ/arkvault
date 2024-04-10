import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";

export interface DelegateTableProperties {
	delegates: Contracts.IReadOnlyWallet[];
	isLoading?: boolean;
	maxVotes: number;
	unvoteDelegates: VoteDelegateProperties[];
	voteDelegates: VoteDelegateProperties[];
	selectedWallet: Contracts.IReadWriteWallet;
	votes: Contracts.VoteRegistryItem[];
	resignedDelegateVotes?: Contracts.VoteRegistryItem[];
	onContinue?: (unvotes: VoteDelegateProperties[], votes: VoteDelegateProperties[]) => void;
	isCompact?: boolean;
	subtitle?: React.ReactNode;
	searchQuery?: string;
	activeWallet?: Contracts.IReadWriteWallet;
}

export interface VoteDelegateProperties {
	delegateAddress: string;
	amount: number;
}

export interface DelegateTableColumnsProperties {
	network: Networks.Network;
	isLoading?: boolean;
}
