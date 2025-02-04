import { Contracts } from "@ardenthq/sdk-profiles";

interface GetDefaultAliasInput {
	profile: Contracts.IProfile;
}

const makeAlias = (count: number) => `Address #${count}`;

export const getDefaultAlias = ({ profile }: GetDefaultAliasInput): string => {
	let counter = profile.wallets().count();

	if (counter === 0) {
		counter = 1;
	}

	while (profile.wallets().findByAlias(makeAlias(counter))) {
		counter++;
	}

	return makeAlias(counter);
};
