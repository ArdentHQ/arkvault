import { Networks } from "@/app/lib/sdk";
import { Contracts } from "@/app/lib/profiles";
import React from "react";
import { SearchableTableWrapperProperties } from "@/app/components/SearchableTableWrapper";
import { FilterOption } from "@/domains/vote/components/VotesFilter";

export interface ValidatorsTableProperties extends Omit<SearchableTableWrapperProperties, "children"> {
	validators: Contracts.IReadOnlyWallet[];
	isLoading?: boolean;
	maxVotes: number;
	unvoteValidators: VoteValidatorProperties[];
	voteValidators: VoteValidatorProperties[];
	selectedWallet: Contracts.IReadWriteWallet;
	votes: Contracts.VoteRegistryItem[];
	resignedValidatorVotes?: Contracts.VoteRegistryItem[];
	onContinue?: (unvotes: VoteValidatorProperties[], votes: VoteValidatorProperties[]) => void;
	subtitle?: React.ReactNode;
	selectedFilter?: FilterOption;
	setSelectedFilter?: (selected: FilterOption) => void;
	selectedAddress?: string;
	totalCurrentVotes?: number;
}

export interface VoteValidatorProperties {
	validatorAddress: string;
	amount: number;
}

export interface ValidatorsTableColumnsProperties {
	network: Networks.Network;
	isLoading?: boolean;
}
