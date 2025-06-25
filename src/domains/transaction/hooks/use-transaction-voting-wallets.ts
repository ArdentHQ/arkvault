import { DTO } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import { useEffect, useState } from "react";

interface Properties {
	transaction: DTO.RawTransactionData;
	profile: Contracts.IProfile;
}

export const useTransactionVotingWallets = ({ transaction, profile }: Properties) => {
	const [isLoading, setIsLoading] = useState(false);
	const [votes, setVotes] = useState<Contracts.VoteRegistryItem[]>([]);
	const [unvotes, setUnvotes] = useState<Contracts.VoteRegistryItem[]>([]);

	useEffect(() => {
		const updateValidators = async () => {
			setIsLoading(true);
			const network = profile.activeNetwork()

			try {
				profile.validators().all(network.id());
			} catch {
				await profile.validators().sync(profile, network.id());
			}

			try {
				const votesList = transaction.votes().map((address: string) => ({
					amount: transaction.value(),
					wallet: profile.validators().findByAddress(network.id(), address),
				}));

				const unvotesList = transaction.unvotes().map((address: string) => ({
					amount: transaction.value(),
					wallet: profile.validators().findByAddress(network.id(), address),
				}));

				setVotes(votesList);
				setUnvotes(unvotesList);
			} catch {
				//
			}

			setIsLoading(false);
		};

		updateValidators();
	}, [profile, transaction]);

	return {
		isLoading,
		unvotes,
		votes,
	};
};
