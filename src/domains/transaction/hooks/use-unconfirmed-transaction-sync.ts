import { Contracts } from "@/app/lib/profiles";
import { UnconfirmedTransactionDataCollection } from "@/app/lib/mainsail/unconfirmed-transactions.collection";
import { RawTransactionData } from "@/app/lib/mainsail/signed-transaction.dto.contract";
import { Network } from "@/app/lib/mainsail/network";
import { get } from "@/app/lib/helpers";
import { useCallback, useEffect, useMemo, useRef } from "react";

/**
 * How long a locally broadcast transaction is protected from being pruned while
 * the network has not reported it yet.
 */
const UNCONFIRMED_PRUNE_TIMEOUT_MS = 60_000;

const DEFAULT_BLOCK_TIME = 8_000; // Close to expected ARK block time

const getBlockTime = (network: Network): number => {
	try {
		const milestone = network.milestone();
		const blockTime = get(milestone, "timeouts.blockTime") as unknown;
		/* istanbul ignore next -- @preserve */
		if (typeof blockTime === "number" && Number.isFinite(blockTime) && blockTime > 0) {
			return Math.max(1000, blockTime); // Minimum of 1 second
		}
	} catch (error) {
		/* istanbul ignore next -- @preserve */
		console.error("Failed to get block time:", error);
	}

	return DEFAULT_BLOCK_TIME;
};

interface FetchUnconfirmedProperties {
	cursor: number;
	flush: boolean;
	mode: string;
	transactionTypes: string[];
	wallets: Contracts.IReadWriteWallet[];
}

interface UnconfirmedTransactionSyncProperties {
	addUnconfirmedTransactionFromApi: (
		networkId: string,
		walletAddress: string,
		transaction: RawTransactionData,
	) => void;
	cleanupUnconfirmedForAddresses: (walletAddresses: string[], remoteHashes: string[], graceMs?: number) => void;
	fetchTransactions: (properties: FetchUnconfirmedProperties) => Promise<unknown>;
	onNewUnconfirmed: () => void;
	profile: Contracts.IProfile;
	transactionTypes: string[];
	wallets: Contracts.IReadWriteWallet[];
}

export interface UnconfirmedTransactionSync {
	fetchUnconfirmedTransactions: () => Promise<void>;
	pollIntervalMs: number;
}

export const useUnconfirmedTransactionSync = ({
	addUnconfirmedTransactionFromApi,
	cleanupUnconfirmedForAddresses,
	fetchTransactions,
	onNewUnconfirmed,
	profile,
	transactionTypes,
	wallets,
}: UnconfirmedTransactionSyncProperties): UnconfirmedTransactionSync => {
	const isFetchingRef = useRef(false);
	const seenHashesRef = useRef(new Set<string>());

	// The callback belongs to the caller and may change identity freely; reading it
	// through a ref keeps the polling callback stable without going stale.
	const onNewUnconfirmedRef = useRef(onNewUnconfirmed);

	useEffect(() => {
		onNewUnconfirmedRef.current = onNewUnconfirmed;
	}, [onNewUnconfirmed]);

	const walletAddresses = wallets.map((wallet) => wallet.address());
	const walletAddressesStr = walletAddresses.join("-");

	const fetchUnconfirmedTransactions = useCallback(async () => {
		/* istanbul ignore next -- @preserve */
		if (wallets.length === 0 || isFetchingRef.current) {
			return;
		}

		try {
			isFetchingRef.current = true;

			const response = (await fetchTransactions({
				cursor: 1,
				flush: true,
				mode: "unconfirmed",
				transactionTypes,
				wallets,
			})) as UnconfirmedTransactionDataCollection;

			const results = response.items();
			const remoteHashes = results.map((transaction) => transaction.hash()).filter(Boolean);

			cleanupUnconfirmedForAddresses(walletAddresses, remoteHashes, UNCONFIRMED_PRUNE_TIMEOUT_MS);

			const hasNewUnconfirmed = remoteHashes.some((hash) => !seenHashesRef.current.has(hash));
			seenHashesRef.current = new Set(remoteHashes);

			if (hasNewUnconfirmed) {
				onNewUnconfirmedRef.current();
			}

			for (const transaction of results) {
				const matched = wallets.find((wallet) => {
					const walletAddress = wallet.address().toLowerCase();
					return (
						walletAddress === transaction.from().toLowerCase() ||
						walletAddress === transaction.to().toLowerCase()
					);
				});

				/* istanbul ignore next -- @preserve */
				if (!matched) {
					continue;
				}

				addUnconfirmedTransactionFromApi(matched.networkId(), matched.address(), transaction.raw());
			}
		} catch (error) {
			/* istanbul ignore next -- @preserve */
			console.error("Failed to fetch unconfirmed transactions:", error);
		}

		isFetchingRef.current = false;
	}, [
		addUnconfirmedTransactionFromApi,
		cleanupUnconfirmedForAddresses,
		fetchTransactions,
		transactionTypes,
		walletAddressesStr,
		wallets,
	]);

	useEffect(() => {
		void fetchUnconfirmedTransactions();
	}, [fetchUnconfirmedTransactions]);

	const pollIntervalMs = useMemo(() => getBlockTime(profile.activeNetwork()), [profile.activeNetwork()]);

	return { fetchUnconfirmedTransactions, pollIntervalMs };
};
