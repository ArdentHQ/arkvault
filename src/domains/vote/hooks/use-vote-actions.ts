import { Contracts } from "@/app/lib/profiles";
import { useNavigate } from "react-router-dom";

import { generatePath } from "react-router";
import { VoteValidatorProperties } from "@/domains/vote/components/ValidatorsTable/ValidatorsTable.contracts";
import { appendParameters } from "@/domains/vote/utils/url-parameters";
import { ProfilePaths } from "@/router/paths";
import { assertString } from "@/utils/assertions";
import { useState } from "react";

interface VoteActionsProperties {
	profile: Contracts.IProfile;
	wallet: Contracts.IReadWriteWallet;
	selectedAddress: string;
	selectedNetwork: string;
	hasWalletId: boolean;
}

export const useVoteActions = ({
	profile,
	wallet,
	selectedAddress,
	selectedNetwork,
	hasWalletId,
}: VoteActionsProperties) => {
	const navigate = useNavigate();

	const [showSendVotePanel, setShowSendVotePanel] = useState(false);

	const navigateToSendVote = (unvotes: VoteValidatorProperties[], votes: VoteValidatorProperties[]) => {
		const walletId = hasWalletId
			? wallet.id()
			: (profile.wallets().findByAddressWithNetwork(selectedAddress, selectedNetwork)?.id() as string);

		assertString(walletId);

		const parameters = new URLSearchParams();

		const nethash = profile.wallets().findById(walletId).network().meta().nethash;

		parameters.set("nethash", nethash);

		appendParameters(parameters, "unvote", unvotes);

		appendParameters(parameters, "vote", votes);

		navigate({
			pathname: generatePath(ProfilePaths.SendVoteWallet, { profileId: profile.id(), walletId }),
			search: `?${parameters}`,
		});
	};

	const openSendVotePanel = (unvotes: VoteValidatorProperties[], votes: VoteValidatorProperties[]) => {
		setShowSendVotePanel(true);
	};

	return { navigateToSendVote, openSendVotePanel, setShowSendVotePanel, showSendVotePanel };
};
