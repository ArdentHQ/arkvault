import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";

interface GetDefaultAliasInput {
	profile: Contracts.IProfile;
	network?: Networks.Network
}

const makeAlias = (count: number) => `Address #${count}`;

const findByAlias = (alias: string, wallets: Contracts.IReadWriteWallet[]) => wallets.find(wallet => wallet.alias() === alias)

export const getDefaultAlias = ({ profile, network }: GetDefaultAliasInput): string => {
	const wallets = network ?
		profile.wallets().findByCoinWithNetwork(network.coin(), network.id()) :
		profile.wallets().values()

	let counter = wallets.length

	if (counter === 0) {
		counter = 1;
	}

	while (findByAlias(makeAlias(counter), wallets)) {
		counter++;
	}

	return makeAlias(counter);
};
