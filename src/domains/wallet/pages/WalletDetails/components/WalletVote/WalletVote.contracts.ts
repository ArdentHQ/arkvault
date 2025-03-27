import { Contracts } from "@ardenthq/sdk-profiles";

export interface VotesProperties {
	votes: Contracts.VoteRegistryItem[];
	activeDelegates: number;
}

export interface DelegateStatusProperties {
	votes: Contracts.VoteRegistryItem[];
	activeDelegates: number;
}
