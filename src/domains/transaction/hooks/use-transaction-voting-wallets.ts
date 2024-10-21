import { useEnvironmentContext } from "@/app/contexts";
import { Networks, DTO } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useEffect, useState } from "react";
import { extractVotingData } from "@/domains/transaction/components/VoteTransactionType/helpers";

interface Properties {
	network: Networks.Network;
	transaction: DTO.RawTransactionData;
	profile: Contracts.IProfile;
}

export const useTransactionVotingWallets = ({ transaction, network, profile }: Properties) => {
	const [isLoading, setIsLoading] = useState(false);
	const [votes, setVotes] = useState<Contracts.VoteRegistryItem[]>([]);
	const [unvotes, setUnvotes] = useState<Contracts.VoteRegistryItem[]>([]);
	const { env } = useEnvironmentContext();

	useEffect(() => {
		const updateDelegates = async () => {
			setIsLoading(true);

			try {
				env.delegates().all(network.coin(), network.id());
			} catch {
				await env.delegates().sync(profile, network.coin(), network.id());
			}

			try {
				const { votes, unvotes } = extractVotingData({ transaction });

				const votesList = votes.map((publicKey: string) => ({
					amount: transaction.amount(),
					wallet: env.delegates().findByPublicKey(network.coin(), network.id(), publicKey),
				}));

				const unvotesList = unvotes.map((publicKey: string) => ({
					amount: transaction.amount(),
					wallet: env.delegates().findByPublicKey(network.coin(), network.id(), publicKey),
				}));

				setVotes(votesList);
				setUnvotes(unvotesList);
			} catch {
				//
			}

			setIsLoading(false);
		};

		updateDelegates();
	}, [transaction, profile, network]);

	return {
		isLoading,
		unvotes,
		votes,
	};
};
