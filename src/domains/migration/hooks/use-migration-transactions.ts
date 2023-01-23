import { useCallback, useEffect, useMemo, useState } from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { ethers } from "ethers";
import { useConfiguration, useMigrations } from "@/app/contexts";
import { useLatestTransactions } from "@/domains/dashboard/hooks";
import { migrationNetwork, migrationWalletAddress } from "@/utils/polygon-migration";

export const useMigrationTransactions = ({ profile }: { profile: Contracts.IProfile }) => {
	const { profileIsSyncing, profileIsRestoring } = useConfiguration();
	const { migrations, storeTransactions } = useMigrations();
	const [isStoringMigrationTransactions, setIsStoringMigrationTransactions] = useState(true);

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

	const storeMigrationTransactions = useCallback(async () => {
		await storeTransactions(migrationTransactions);
		setIsStoringMigrationTransactions(false);
	}, [storeTransactions, migrationTransactions]);

	useEffect(() => {
		if (isLoadingTransactions) {
			setIsStoringMigrationTransactions(true);
		}
	}, [isLoadingTransactions]);

	useEffect(() => {
		storeMigrationTransactions();
	}, [storeMigrationTransactions]);

	const isLoading = useMemo(() => {
		if (profileIsRestoring) {
			return true;
		}

		if (isLoadingTransactions) {
			return true;
		}

		if (isStoringMigrationTransactions) {
			return true;
		}

		return migrations === undefined;
	}, [isLoadingTransactions, migrations, migrationTransactions, profileIsRestoring]);

	return { isLoading, migrations: migrations || [] };
};
