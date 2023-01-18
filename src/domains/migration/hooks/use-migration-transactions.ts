import { useEffect, useMemo } from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { ethers } from "ethers";
import { useConfiguration, useMigrations } from "@/app/contexts";
import { useLatestTransactions } from "@/domains/dashboard/hooks";
import { migrationNetwork, migrationWalletAddress } from "@/utils/polygon-migration";

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

				if (transaction.recipient() !== migrationWalletAddress()) {
					return false;
				}

				return ethers.utils.isAddress(polygonAddress);
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

		if (!(migrationTransactions.length > 0 && !migrations)) {
			console.log("case 1", migrationTransactions, migrations);
		}

		return migrationTransactions.length > 0 && !migrations;
	};

	return { isLoading: isLoading(), migrations: migrations || [] };
};
