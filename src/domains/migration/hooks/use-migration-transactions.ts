import { useEffect, useMemo } from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useConfiguration, useMigrations } from "@/app/contexts";
import { useLatestTransactions } from "@/domains/dashboard/hooks";
import { migrationNetwork } from "@/utils/polygon-migration";

export const useMigrationTransactions = ({ profile }: { profile: Contracts.IProfile }) => {
	const { profileIsSyncing } = useConfiguration();
	const { migrations, storeTransaction } = useMigrations();

	const { isLoadingTransactions, latestTransactions } = useLatestTransactions({
		limit: 100,
		profile,
		profileIsSyncing,
		wallets: profile
			.wallets()
			.values()
			.filter((wallet) => wallet.networkId() === migrationNetwork()),
	});

	const migrationTransactions = useMemo(
		() =>
			latestTransactions.filter((transaction) => {
				const polygonAddress = transaction.memo();

				if (!polygonAddress) {
					return false;
				}

				return true;
			}),
		[latestTransactions, isLoadingTransactions],
	);

	useEffect(() => {
		for (const transaction of migrationTransactions) {
			storeTransaction(transaction);
		}
	}, [migrationTransactions]);

	const isLoading = () => {
		if (isLoadingTransactions) {
			return true;
		}

		return migrationTransactions.length > 0 && !migrations;
	};

	return { isLoading: isLoading(), migrations: migrations || [] };
};
