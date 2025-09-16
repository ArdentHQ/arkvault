import { Networks } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";

export interface SendVoteStepProperties {
	wallet: Contracts.IReadWriteWallet;
	votes: Contracts.VoteRegistryItem[];
	unvotes: Contracts.VoteRegistryItem[];
	network: Networks.Network;
	profile: Contracts.IProfile;
	hideHeader?: boolean;
}
