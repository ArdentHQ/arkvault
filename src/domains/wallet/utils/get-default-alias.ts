import { Networks } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";

interface GetDefaultAliasInput {
	profile: Contracts.IProfile;
	network?: Networks.Network;
	addressIndex?: number;
}
interface GetLedgerDefaultAliasInput extends GetDefaultAliasInput {
	path: string;
}

const makeAlias = (count: number) => `Address #${count}`;
const makeLedgerAlias = (count: number | string) => `Ledger #${count}`;

const findByAlias = (alias: string, wallets: Contracts.IReadWriteWallet[]) =>
	wallets.find((wallet) => wallet.alias() === alias);

export const getDefaultAlias = ({ profile, addressIndex }: GetDefaultAliasInput): string => {
	const wallets = profile
		.wallets()
		.values()
		.filter((wallet) => !wallet.isLedger());

	let counter = addressIndex === undefined ? wallets.length : 1;

	if (counter === 0) {
		counter = 1;
	}

	while (findByAlias(makeAlias(counter), wallets)) {
		counter++;
	}

	return makeAlias(counter);
};

export const getLedgerDefaultAlias = ({ profile, path }: GetLedgerDefaultAliasInput): string => {
	const pathCounter = path.slice(-1) ?? 0;
	let counter = Number(pathCounter) + 1;

	const wallets = profile
		.wallets()
		.values()
		.filter((wallet) => wallet.isLedger());

	while (findByAlias(makeLedgerAlias(counter), wallets)) {
		counter++;
	}

	return makeLedgerAlias(counter);
};
