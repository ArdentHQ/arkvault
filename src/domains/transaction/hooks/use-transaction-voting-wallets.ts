import { useEnvironmentContext } from "@/app/contexts";
import { Networks } from "@ardenthq/sdk";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { useEffect, useState } from "react";

interface Properties {
	network: Networks.Network;
	transaction: DTO.ExtendedSignedTransactionData | DTO.ExtendedConfirmedTransactionData
	profile: Contracts.IProfile
}

export const useTransactionVotingWallets = ({ transaction, network, profile }: Properties) => {
	const [isLoading, setIsLoading] = useState(false)
	const [votes, setVotes] = useState<{ wallet: Contracts.IReadWriteWallet }[]>([])
	const [unvotes, setUnvotes] = useState<{ wallet: Contracts.IReadWriteWallet }[]>([])
	const { env } = useEnvironmentContext();

	useEffect(() => {
		const updateDelegates = async () => {
			setIsLoading(true)

			try {
				env.delegates().all(network.coin(), network.id());
			} catch {
				await env.delegates().sync(profile, network.coin(), network.id());
			}

			try {
				const unvotesList = transaction.unvotes().map((publicKey) => ({
					wallet: env.delegates().findByPublicKey(network.coin(), network.id(), publicKey)
				}));

				const votes = transaction.votes().map((publicKey) => ({
					wallet: env.delegates().findByPublicKey(network.coin(), network.id(), publicKey)
				}));
			} catch {
				//
			}

			setVotes(votes)
			setUnvotes(unvotes)
			setIsLoading(false)
		};

		updateDelegates()
	}, [])

	return {
		isLoading,
		unvotes,
		votes,
	}
}
