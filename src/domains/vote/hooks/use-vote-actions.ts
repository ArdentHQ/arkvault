import { Contracts } from "@ardenthq/sdk-profiles";
import { useHistory } from "react-router-dom";

import { generatePath } from "react-router";
import { VoteDelegateProperties } from "@/domains/vote/components/DelegateTable/DelegateTable.contracts";
import { appendParameters } from "@/domains/vote/utils/url-parameters";
import { ProfilePaths } from "@/router/paths";

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
	const history = useHistory();

	const navigateToSendVote = (unvotes: VoteDelegateProperties[], votes: VoteDelegateProperties[]) => {
		const activeWallet = hasWalletId
			? wallet
			: profile.wallets().findByAddressWithNetwork(selectedAddress, selectedNetwork);

		const parameters = new URLSearchParams();

		appendParameters(parameters, "unvote", unvotes);

		appendParameters(parameters, "vote", votes);

		if (activeWallet) {
			parameters.set("walletId", activeWallet.id());
			parameters.set("nethash", activeWallet.network().meta().nethash);
		}

		history.push({
			pathname: generatePath(ProfilePaths.SendVote, { profileId: profile.id() }),
			search: `?${parameters}`,
		});
	};

	return { navigateToSendVote };
};
