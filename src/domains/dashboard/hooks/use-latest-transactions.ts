import { sortByDesc } from "@payvo/sdk-helpers";
import { Contracts, DTO } from "@payvo/sdk-profiles";
import { useEffect, useState } from "react";

import { useWalletConfig } from "@/domains/wallet/hooks";
import { useProfileTransactions } from "@/domains/transaction/hooks/use-profile-transactions";

interface LatestTransactionsStateProperties {
	latestTransactions: DTO.ExtendedConfirmedTransactionData[];
	isLoadingTransactions: boolean;
}

interface LatestTransactionsProperties {
	profile: Contracts.IProfile;
	profileIsSyncing: boolean;
}

export const useLatestTransactions = ({ profile, profileIsSyncing }: LatestTransactionsProperties) => {
	const limit = 10;
	const [{ latestTransactions, isLoadingTransactions }, setState] = useState<LatestTransactionsStateProperties>({
		isLoadingTransactions: true,
		latestTransactions: [],
	});

	const { selectedWallets } = useWalletConfig({ profile });

	const {
		updateFilters,
		transactions,
		isLoadingTransactions: isLoading,
	} = useProfileTransactions({
		limit,
		profile,
		wallets: selectedWallets,
	});

	useEffect(() => {
		if (profileIsSyncing) {
			return;
		}

		updateFilters({
			activeMode: "all",
			activeTransactionType: undefined,
		});
	}, [profileIsSyncing, updateFilters]);

	useEffect(() => {
		if (isLoading) {
			return;
		}

		const latestTransactions = sortByDesc(transactions, (transaction) => transaction.timestamp()?.toUNIX()).slice(
			0,
			limit,
		);

		setState({
			isLoadingTransactions: false,
			latestTransactions,
		});
	}, [isLoading, transactions]);

	return {
		isLoadingTransactions,
		latestTransactions,
	};
};
