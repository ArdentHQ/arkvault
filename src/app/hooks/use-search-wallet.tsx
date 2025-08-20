import { Contracts } from "@/app/lib/profiles";
import { useCallback, useMemo, useState } from "react";

import { useWalletAlias } from "./use-wallet-alias";
import { RecipientProperties } from "@/domains/transaction/components/SearchRecipient/SearchRecipient.contracts";

interface SearchWalletProperties {
	profile: Contracts.IProfile;
	wallets: (Contracts.IReadWriteWallet | RecipientProperties)[];
}

export const useSearchWallet = ({ profile, wallets }: SearchWalletProperties) => {
	const [searchKeyword, setSearchKeyword] = useState("");
	const { getWalletAlias } = useWalletAlias();

	const isRecipientList = useMemo(() => {
		const first = wallets?.[0] as any;
		return typeof first?.address === "string";
	}, [wallets]);

	const allProfileWallets = useMemo(() => profile.wallets().values(), [profile]);

	const normalizedList = useMemo(() => {
		if (!wallets || wallets.length === 0) {
			return [];
		}

		if (isRecipientList) {
			const recipients = wallets as RecipientProperties[];
			return recipients.map((recipient) => {
				const resolvedWallet = allProfileWallets.find((w) => w.address() === recipient.address);
				const { alias } = getWalletAlias({
					address: recipient.address,
					network: resolvedWallet?.network(),
					profile,
				});
				return { ...recipient, alias: alias ?? recipient.alias };
			});
		}

		return wallets;
	}, [wallets, isRecipientList, allProfileWallets, getWalletAlias, profile]);

	const matchKeyword = useCallback(
		(value?: string) => value?.toLowerCase().includes(searchKeyword.toLowerCase()),
		[searchKeyword],
	);

	const filteredList = useMemo(() => {
		if (searchKeyword.length === 0) {
			return normalizedList;
		}

		if (isRecipientList) {
			const recipients = normalizedList as RecipientProperties[];
			return recipients.filter(({ address, alias }) => matchKeyword(address) || matchKeyword(alias));
		}

		const typedWallets = normalizedList as Contracts.IReadWriteWallet[];
		return typedWallets.filter((wallet) => {
			const { alias } = getWalletAlias({
				address: wallet.address(),
				network: wallet.network(),
				profile,
			});
			return matchKeyword(wallet.address()) || matchKeyword(alias);
		});
	}, [normalizedList, isRecipientList, matchKeyword, searchKeyword.length, getWalletAlias, profile]);

	const isEmptyResults = useMemo(
		() => searchKeyword.length > 0 && filteredList.length === 0,
		[filteredList.length, searchKeyword.length],
	);

	return {
		filteredList,
		isEmptyResults,
		setSearchKeyword,
	};
};
