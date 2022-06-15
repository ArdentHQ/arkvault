import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import { networkDisplayName } from "@/utils/network-utils";

interface GetDefaultAliasInput {
	profile: Contracts.IProfile;
	network: Networks.Network;
}

export const getDefaultAlias = ({ profile, network }: GetDefaultAliasInput): string => {
	const makeAlias = (count: number) => `${networkDisplayName(network)} #${count}`;

	const sameCoinWallets = profile.wallets().findByCoinWithNetwork(network.coin(), network.id());

	let counter = sameCoinWallets.length;

	if (counter === 0) {
		counter = 1;
	}

	while (profile.wallets().findByAlias(makeAlias(counter))) {
		counter++;
	}

	return makeAlias(counter);
};
