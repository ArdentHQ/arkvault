import { Contracts } from "@/app/lib/profiles";

export const getAccountName = ({ profile }: { profile: Contracts.IProfile }): string => {
	let counter = 1;

	while (findByAccountName(profile.wallets().values(), makeAccountName(counter))) {
		counter++;
	}

	return makeAccountName(counter);
};

const makeAccountName = (counter: number) => `HD ${counter}`;

const findByAccountName = (wallets: Contracts.IReadWriteWallet[], name: string) =>
	wallets.some((wallet) => wallet.accountName() === name);
