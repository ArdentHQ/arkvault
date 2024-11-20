import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";

export const sendVote = (t: any) => ({
	network: () => ({
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("COMMON.NETWORK"),
		}),
	}),
	senderAddress: ({
		profile,
		network,
		votes,
	}: {
		profile?: Contracts.IProfile;
		network: Networks.Network;
		votes: Contracts.VoteRegistryItem[];
	}) => ({
		validate: (address: string) => {
			if (votes.length === 0) {
				return true;
			}

			if (!address) {
				return t("COMMON.VALIDATION.FIELD_REQUIRED", {
					field: t("COMMON.SENDER_ADDRESS"),
				});
			}

			const wallet = profile?.wallets().findByAddressWithNetwork(address, network.id());

			if (!wallet) {
				return true;
			}

			const votingDelegates = wallet?.voting().current();
			const voteAddresses = new Set(votes.map((vote) => vote.wallet?.address()));

			if (votingDelegates.some((delegate) => voteAddresses.has(delegate.wallet?.address()))) {
				return t("TRANSACTION.VALIDATION.ALREADY_VOTING", {
					validator: votes[0].wallet?.username(),
					wallet: wallet?.displayName(),
				});
			}

			return true;
		},
	}),
});
