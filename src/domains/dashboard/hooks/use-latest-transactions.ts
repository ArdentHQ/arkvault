import { Contracts } from "@ardenthq/sdk-profiles";
import { useEffect } from "react";

import { useWalletConfig } from "@/domains/wallet/hooks";
import { useProfileTransactions } from "@/domains/transaction/hooks/use-profile-transactions";

interface LatestTransactionsProperties {
	profile: Contracts.IProfile;
	profileIsSyncing: boolean;
}

export const useLatestTransactions = ({ profile, profileIsSyncing }: LatestTransactionsProperties) => {
	const limit = 10;

	const { selectedWallets } = useWalletConfig({ profile });

	const { updateFilters, transactions, isLoadingTransactions } = useProfileTransactions({
		limit,
		orderBy: "timestamp:desc",
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

	return {
		isLoadingTransactions,
		latestTransactions: transactions.slice(0, limit),
	};
};
