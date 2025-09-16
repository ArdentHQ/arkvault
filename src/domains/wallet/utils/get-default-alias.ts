import { Networks } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import { WalletSetting } from "@/app/lib/profiles/wallet.enum";

interface GetDefaultAliasInput {
	profile: Contracts.IProfile;
	network?: Networks.Network;
}
interface GetLedgerDefaultAliasInput extends GetDefaultAliasInput {
	path: string;
}

const makeAlias = (count: number) => `Address #${count}`;
const makeLedgerAlias = (count: number | string) => `Ledger #${count}`;

const findByAlias = (alias: string, wallets: Contracts.IReadWriteWallet[]) =>
	wallets.find((wallet) => wallet.settings().get(WalletSetting.Alias) === alias);

export const getDefaultAlias = ({ profile }: GetDefaultAliasInput): string => {
	const wallets = profile
		.wallets()
		.values()
		.filter((wallet) => !wallet.isLedger());

	let counter = wallets.length;

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
