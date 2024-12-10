import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";

export interface ValidatorsTableProperties {
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
	searchQuery?: string;
}

export interface VoteValidatorProperties {
	validatorAddress: string;
	amount: number;
}

export interface ValidatorsTableColumnsProperties {
	network: Networks.Network;
	isLoading?: boolean;
}
