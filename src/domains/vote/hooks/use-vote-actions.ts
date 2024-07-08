import { Contracts } from "@ardenthq/sdk-profiles";
import { useNavigate } from "react-router-dom";

import { generatePath } from "react-router";
import { VoteDelegateProperties } from "@/domains/vote/components/DelegateTable/DelegateTable.contracts";
import { appendParameters } from "@/domains/vote/utils/url-parameters";
import { ProfilePaths } from "@/router/paths";
import { assertString } from "@/utils/assertions";

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

	const navigateToSendVote = (unvotes: VoteDelegateProperties[], votes: VoteDelegateProperties[]) => {
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

	return { navigateToSendVote };
};
