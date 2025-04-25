import { useEnvironmentContext } from "@/app/contexts";
import { Networks, DTO } from "@ardenthq/sdk";
import { Contracts } from "@/app/lib/profiles";
import { useEffect, useState } from "react";

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
		const updateValidators = async () => {
			setIsLoading(true);

			try {
				env.validators().all(network.coin(), network.id());
			} catch {
				await env.validators().sync(profile, network.coin(), network.id());
			}

			try {
				const votesList = transaction.votes().map((address: string) => ({
					amount: transaction.value(),
					wallet: env.validators().findByAddress(network.coin(), network.id(), address),
				}));

				const unvotesList = transaction.unvotes().map((address: string) => ({
					amount: transaction.value(),
					wallet: env.validators().findByAddress(network.coin(), network.id(), address),
				}));

				setVotes(votesList);
				setUnvotes(unvotesList);
			} catch {
				//
			}

			setIsLoading(false);
		};

		updateValidators();
	}, [transaction, profile, network]);

	return {
		isLoading,
		unvotes,
		votes,
	};
};
