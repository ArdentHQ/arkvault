import { Networks } from "@payvo/sdk";
import { Contracts } from "@payvo/sdk-profiles";
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
}

export interface VoteDelegateProperties {
	delegateAddress: string;
	amount: number;
}

export interface DelegateTableColumnsProperties {
	network: Networks.Network;
	isLoading?: boolean;
}
