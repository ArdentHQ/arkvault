import { useCallback, useEffect, useMemo, useState } from "react";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { ethers } from "ethers";
import { useConfiguration, useMigrations } from "@/app/contexts";
import { migrationNetwork, migrationWalletAddress, polygonMigrationStartTime } from "@/utils/polygon-migration";
import { Migration } from "@/domains/migration/migration.contracts";

export const useMigrationTransactions = ({ profile }: { profile: Contracts.IProfile }) => {
	const { profileIsRestoring } = useConfiguration();
	const { migrations, storeTransaction } = useMigrations();
	const [latestTransactions, setLatestTransactions] = useState<DTO.ExtendedConfirmedTransactionData[]>([]);
	const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

	useEffect(() => {
		const loadMigrationWalletTransactions = async () => {
			setIsLoadingTransactions(true);

			if (profileIsRestoring) {
				return;
			}

			const wallet = await profile.walletFactory().fromAddress({
				address: migrationWalletAddress(),
				coin: "ARK",
				network: migrationNetwork(),
			});

			console.log({
				address: migrationWalletAddress(),
				coin: "ARK",
				network: migrationNetwork(),
			});

			const senderIds = profile
				.wallets()
				.values()
				.filter((wallet) => wallet.networkId() === migrationNetwork())
				.map((wallet) => wallet.address());

			if (senderIds.length === 0) {
				setIsLoadingTransactions(false);
				return;
			}

			const query: {
				recipientId: string;
				senderId: string;
				timestamp?: { from?: number; to?: number };
			} = {
				recipientId: migrationWalletAddress(),
				senderId: senderIds.join(","),
			};

			if (polygonMigrationStartTime() > 0) {
				query.timestamp = { from: polygonMigrationStartTime() };
			}

			const transactions = await wallet.transactionIndex().received(query);

			setLatestTransactions(transactions.items());
			setIsLoadingTransactions(false);
		};

		loadMigrationWalletTransactions();
	}, [profileIsRestoring]);

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
		console.log({ migrationTransactions });
		for (const transaction of migrationTransactions) {
			storeTransaction(transaction);
		}
	}, [migrationTransactions]);

	const resolveTransaction = useCallback(
		(migration: Migration) => {
			console.log({ latestTransactions });
			return latestTransactions.find((transaction) => transaction.id() === migration.id);
		},
		[latestTransactions],
	);

	const isLoading = useMemo(() => {
		if (profileIsRestoring) {
			return true;
		}

		if (isLoadingTransactions) {
			return true;
		}

		return migrationTransactions.length > 0 && !migrations;
	}, [profileIsRestoring, isLoadingTransactions, migrationTransactions, migrations]);

	return { isLoading, migrations: migrations || [], resolveTransaction };
};
