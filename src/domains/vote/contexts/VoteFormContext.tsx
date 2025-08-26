import React, { useEffect, useState } from "react";
import { Contracts } from "@/app/lib/profiles";
import { VoteValidatorProperties } from "@/domains/vote/components/ValidatorsTable/ValidatorsTable.contracts";
import { Networks } from "@/app/lib/mainsail";

interface Properties {
	children: React.ReactNode;
	profile: Contracts.IProfile;
	wallet: Contracts.IReadWriteWallet;
	network: Networks.Network;
}

const VoteFormContext = React.createContext<any>(undefined);

export const VoteFormProvider = ({ profile, network, children }: Properties) => {
	const [showSendVotePanel, setShowSendVotePanel] = useState(false);

	const [voteValidators, setVoteValidators] = useState<VoteValidatorProperties[]>([]);
	const [unvoteValidators, setUnvoteValidators] = useState<VoteValidatorProperties[]>([]);
	const [votes, setVotes] = useState<Contracts.VoteRegistryItem[]>([]);
	const [unvotes, setUnvotes] = useState<Contracts.VoteRegistryItem[]>([]);

	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const updateValidators = async () => {
			setIsLoading(true);

			try {
				profile.validators().all(network.id());
			} catch {
				await profile.validators().sync(network.id());
			}

			if (unvoteValidators.length > 0 && unvotes.length === 0) {
				const unvotesList: Contracts.VoteRegistryItem[] = unvoteValidators?.map((unvote) => ({
					amount: unvote.amount,
					wallet: profile.validators().findByAddress(network.id(), unvote.validatorAddress),
				}));

				setUnvotes(unvotesList);
			}

			if (voteValidators.length > 0 && votes.length === 0) {
				const votesList: Contracts.VoteRegistryItem[] = voteValidators?.map((vote) => ({
					amount: vote.amount,
					wallet: profile.validators().findByAddress(network.id(), vote.validatorAddress),
				}));

				setVotes(votesList);
			}

			setIsLoading(false);
		};

		updateValidators();
	}, [profile, voteValidators, votes, unvoteValidators, unvotes]);

	const openSendVotePanel = (unvotes: VoteValidatorProperties[], votes: VoteValidatorProperties[]) => {
		setVoteValidators(votes);
		setUnvoteValidators(unvotes);

		setShowSendVotePanel(true);
	};

	const handleSetShowSendVotePanel = (show: boolean) => {
		if (!show) {
			setVoteValidators([]);
			setUnvoteValidators([]);
			setVotes([]);
			setUnvotes([]);
		}

		setShowSendVotePanel(show);
	};

	return (
		<VoteFormContext.Provider
			value={{
				isLoading,
				openSendVotePanel,
				setShowSendVotePanel: handleSetShowSendVotePanel,
				setUnvotes,
				showSendVotePanel,
				unvotes,
				votes,
			}}
		>
			{children}
		</VoteFormContext.Provider>
	);
};

export const useVoteFormContext = () => {
	const context = React.useContext(VoteFormContext);
	if (context === undefined) {
		throw new Error("[useVoteFormContext] Component not wrapped within a Provider");
	}
	return context;
};
