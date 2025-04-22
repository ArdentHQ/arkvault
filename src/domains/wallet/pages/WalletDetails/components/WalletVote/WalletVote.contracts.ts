import { Contracts } from "@/app/lib/profiles";

export interface VotesProperties {
	votes: Contracts.VoteRegistryItem[];
	activeDelegates: number;
}

export interface DelegateStatusProperties {
	votes: Contracts.VoteRegistryItem[];
	activeDelegates: number;
}
