import { Contracts } from "@ardenthq/sdk-profiles";

export interface VoteListProperties {
	votes: Contracts.VoteRegistryItem[] | Contracts.IReadOnlyWallet[];
	currency: string;
	isNegativeAmount?: boolean;
}

export interface VoteItemProperties {
	wallet: Contracts.IReadOnlyWallet;
	amount?: number;
	currency: string;
	isNegativeAmount?: boolean;
	index: number;
}
