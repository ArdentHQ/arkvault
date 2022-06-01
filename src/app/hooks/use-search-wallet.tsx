import { Contracts } from "@payvo/sdk-profiles";
import { useCallback, useMemo, useState } from "react";

import { useWalletAlias } from "./use-wallet-alias";
import { RecipientProperties } from "@/domains/transaction/components/SearchRecipient/SearchRecipient.contracts";

interface SearchWalletProperties {
	profile?: Contracts.IProfile;
	wallets: (Contracts.IReadWriteWallet | RecipientProperties)[];
}

export const useSearchWallet = ({ profile, wallets }: SearchWalletProperties) => {
	const [searchKeyword, setSearchKeyword] = useState("");
	const { getWalletAlias } = useWalletAlias();

	const matchKeyword = useCallback(
		(value?: string) => value?.toLowerCase().includes(searchKeyword.toLowerCase()),
		[searchKeyword],
	);

	const filteredList = useMemo(() => {
		if (searchKeyword.length === 0) {
			return wallets;
		}

		if (typeof wallets[0].address === "string") {
			return (wallets as RecipientProperties[]).filter(
				({ address, alias }) => matchKeyword(address) || matchKeyword(alias),
			);
		}

		return (wallets as Contracts.IReadWriteWallet[]).filter((wallet) => {
			const { alias } = getWalletAlias({
				address: wallet.address(),
				network: wallet.network(),
				profile,
			});

			return matchKeyword(wallet.address()) || matchKeyword(alias);
		});
	}, [getWalletAlias, wallets, matchKeyword, profile, searchKeyword.length]);

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
