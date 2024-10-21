import { useEnvironmentContext } from "@/app/contexts";
import { Networks, DTO } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useEffect, useState } from "react";

interface Properties {
	network: Networks.Network;
	transaction: DTO.RawTransactionData;
	profile: Contracts.IProfile;
}

/**
 * @TODO: This can be handled in SDK to retrieve voting and unvoting public keys (or generally the asset data)
 * through a common method/format, whether it's a signed or confirmed transaction.
 * Currently `data` is a function in signed transaction and an object in confirmed transaction.
 */
const extractVotingData = ({ transaction }: { transaction: DTO.RawTransactionData }) => {
	const data =
		typeof transaction.data?.().data === "function" ? transaction.data?.().data() : transaction.data?.().data;
	const votes = data?.asset?.votes ?? [];
	const unvotes = data?.asset?.unvotes ?? [];

	return {
		unvotes: unvotes.map((publicKey: string) => publicKey.replace(/^[+-]+/, "")),
		votes: votes.map((publicKey: string) => publicKey.replace(/^[+-]+/, "")),
	};
};

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
			} catch (error) {
				console.log({ error });
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
