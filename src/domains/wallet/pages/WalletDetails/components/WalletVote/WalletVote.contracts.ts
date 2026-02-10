import { Contracts } from "@/app/lib/profiles";

export interface VotesProperties {
	votes: Contracts.VoteRegistryItem[];
	activeValidators: number;
	withDivider?: boolean;
}

export interface ValidatorStatusProperties {
	votes: Contracts.VoteRegistryItem[];
	activeValidators: number;
}
