import { Contracts } from "@ardenthq/sdk-profiles";

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
