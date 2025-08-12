import { Contracts, DTO } from "@/app/lib/profiles";
import { useMemo, useEffect, useCallback } from "react";
import { useLocalStorage } from "usehooks-ts";

interface CachedNotificationData {
	transactions: any[];
	notifications: Contracts.INotification[];
	lastSync: number;
}

export const useNotifications = ({ profile }: { profile: Contracts.IProfile }) => {
	const storageKey = `notifications_${profile.id()}`;
	const [cachedData, setCachedData] = useLocalStorage<CachedNotificationData | null>(storageKey, null);

	const isSyncing = profile.notifications().transactions().isSyncing();
	const liveTransactions = profile.notifications().transactions().transactions();
	const liveNotifications = Object.values(profile.notifications().all());

	const transactions = useMemo((): DTO.ExtendedConfirmedTransactionData[] => {
		if (liveTransactions.length > 0) {
			return liveTransactions;
		}

		if (cachedData?.lastSync) {
			const isRecent = Date.now() - cachedData.lastSync < 24 * 60 * 60 * 1000;
			if (isRecent && cachedData.transactions.length > 0) {
				return cachedData.transactions.map((cachedTx) => ({
					fee: () => cachedTx.fee,
					from: () => cachedTx.from,
					hash: () => cachedTx.hash,
					isMultiPayment: () => cachedTx.isMultiPayment,
					isReceived: () => cachedTx.isReceived,
					isSent: () => cachedTx.isSent,
					isUnvote: () => cachedTx.isUnvote,
					isUsernameRegistration: () => cachedTx.isUsernameRegistration,
					isUsernameResignation: () => cachedTx.isUsernameResignation,
					isValidatorRegistration: () => cachedTx.isValidatorRegistration,
					isVote: () => cachedTx.isVote,
					isVoteCombination: () => cachedTx.isVoteCombination,
					recipients: () => cachedTx.recipients || [],
					timestamp: () =>
						cachedTx.timestamp
							? {
									toISOString: () => cachedTx.timestamp.toISOString,
									toUNIX: () => cachedTx.timestamp.toUNIX,
								}
							: null,
					to: () => cachedTx.to,
					toObject: () => cachedTx._rawData,
					type: () => cachedTx.type,
					value: () => cachedTx.value,
					wallet: () => ({
						currency: () => cachedTx.wallet.currency,
						network: () => ({
							coin: () => cachedTx.wallet.network.coin,
							id: () => cachedTx.wallet.network.id,
							name: () => cachedTx.wallet.network.name,
						}),
					}),
				})) as DTO.ExtendedConfirmedTransactionData[];
			}
		}

		return [];
	}, [liveTransactions, cachedData]);

	const hasCachedData = useMemo(() => {
		if (cachedData?.lastSync) {
			const isRecent = Date.now() - cachedData.lastSync < 24 * 60 * 60 * 1000;
			return isRecent && cachedData.transactions.length > 0;
		}
		return false;
	}, [cachedData]);

	useEffect(() => {
		if (liveTransactions.length > 0) {
			const dataToCache: CachedNotificationData = {
				lastSync: Date.now(),
				notifications: liveNotifications,
				transactions: liveTransactions.map((tx) => tx.toObject()),
			};

			setCachedData(dataToCache);
		}
	}, [liveTransactions.length, liveNotifications.length, setCachedData]);

	const triggerInitialSync = useCallback(async () => {
		const hasLiveData = liveTransactions.length > 0;

		if (!hasLiveData && !hasCachedData && !isSyncing) {
			try {
				await profile.notifications().transactions().sync();
			} catch (error) {
				/* istanbul ignore next -- @preserve */
				console.error("Failed to sync notifications on initialization:", error);
			}
		}
	}, [profile, isSyncing, liveTransactions.length, hasCachedData]);

	useEffect(() => {
		triggerInitialSync();
	}, [triggerInitialSync]);

	const isNotificationUnread = (transaction: DTO.ExtendedConfirmedTransactionData) =>
		liveNotifications.some((notification) => {
			const isUnread = notification.read_at === undefined;
			return notification.meta?.transactionId === transaction.hash() && isUnread;
		});

	const { markAllTransactionsAsRead, markAsRead } = useMemo(() => {
		const markAllTransactionsAsRead = (isVisible: boolean) => {
			if (!isVisible) {
				return;
			}
			profile.notifications().transactions().markAllAsRead();
		};

		const markAsRead = (isVisible: boolean, id: string) => {
			if (!isVisible) {
				return;
			}
			profile.notifications().markAsRead(id);
		};

		return { markAllTransactionsAsRead, markAsRead };
	}, [profile]);

	return {
		hasUnread: transactions.length > 0 && profile.notifications().hasUnread(),
		isNotificationUnread,
		isSyncing,
		markAllTransactionsAsRead,
		markAsRead,
		transactions,
	};
};
