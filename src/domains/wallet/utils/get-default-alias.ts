import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import { networkDisplayName } from "@/utils/network-utils";

interface GetDefaultAliasInput {
	profile: Contracts.IProfile;
}

export const getDefaultAlias = ({ profile}: GetDefaultAliasInput): string => {
	const makeAlias = (count: number) => `Address #${count}`;

	let counter = profile.wallets().count();

	if (counter === 0) {
		counter = 1;
	}

	while (profile.wallets().findByAlias(makeAlias(counter))) {
		counter++;
	}

	return makeAlias(counter);
};
