import { Contracts } from "@payvo/sdk-profiles";

export interface EmptyVotesProperties {
	wallet: Contracts.IReadWriteWallet;
}

export interface VotesProperties {
	wallet: Contracts.IReadWriteWallet;
	votes: Contracts.VoteRegistryItem[];
	activeDelegates: number;
	onButtonClick: (address?: string) => void;
}

export interface DelegateStatusProperties {
	votes: Contracts.VoteRegistryItem[];
	activeDelegates: number;
}
