import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";

export interface SendVoteStepProperties {
	wallet: Contracts.IReadWriteWallet;
	votes: Contracts.VoteRegistryItem[];
	unvotes: Contracts.VoteRegistryItem[];
	network: Networks.Network;
}
