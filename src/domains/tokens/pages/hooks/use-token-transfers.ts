import { Contracts, Contracts as ProfileContracts, DTO } from "@/app/lib/profiles";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSynchronizer } from "@/app/hooks";
import { SortBy } from "@/app/components/Table";
import { delay } from "@/utils/delay";
import { TokenTransfersQuery} from "@/app/lib/mainsail/client.contract";

interface TokenTransfersState {
	transfers: DTO.ExtendedConfirmedTransactionData[];
	isLoadingTransfers: boolean;
	isLoadingMore: boolean;
	hasMore?: boolean;
}

interface FetchTokenTransfersProperties {
	wallets: ProfileContracts.IReadWriteWallet[];
	page?: number;
	orderBy?: string;
}

interface TokenTransfersProperties {
	profile: Contracts.IProfile;
	wallets: Contracts.IReadWriteWallet[];
	limit?: number;
	orderBy?: string;
}

export const useTokenTransfers = ({ profile, wallets, limit = 30 }: TokenTransfersProperties) => {
	const currentPage = useRef(1);

	const [sortBy, setSortBy] = useState<SortBy>({ column: "date", desc: true });

	const orderBy = sortBy; // format sortBy based on API needs

	const [{ transfers, isLoadingTransfers, isLoadingMore, hasMore }, setState] = useState<TokenTransfersState>({
		hasMore: true,
		isLoadingMore: false,
		isLoadingTransfers: true,
		transfers: [],
	});

	const selectedWalletAddresses = wallets.map((wallet) => wallet.address()).join("-");

	useEffect(() => {
		const loadTokenTransfers = async () => {
			try {
				const response = await fetchTokenTransfers({
					wallets,
				});

				setState((state) => ({
					...state,
					hasMore: response.hasMorePages() as boolean,
					isLoadingTransfers: false,
					transfers: response.items(),
				}));
			} catch (error) {
				/* istanbul ignore next -- @preserve */
				console.error({ error });
			}
		};

		delay(() => loadTokenTransfers(), 0);
	}, [selectedWalletAddresses, orderBy]);

	const fetchTokenTransfers = useCallback(
		async ({ wallets, page }: FetchTokenTransfersProperties) => {
			if (wallets.length === 0) {
				return { hasMorePages: () => false, items: () => [] };
			}

			const queryParameters: TokenTransfersQuery = {
				from: wallets.map((wallet) => wallet.address()),
				limit,
				page,
				// orderBy,
			};

			return profile.tokens().transfers(queryParameters);
		},
		[limit, orderBy, profile],
	);

	const fetchMore = useCallback(async () => {
		currentPage.current = currentPage.current + 1;
		setState((state) => ({ ...state, isLoadingMore: true }));

		const response = await fetchTokenTransfers({
			page: currentPage.current,
			wallets,
		});

		setState((state) => ({
			...state,
			hasMore: response.hasMorePages() as boolean,
			isLoadingMore: false,
			transfers: [...state.transfers, ...response.items()],
		}));
	}, [wallets, fetchTokenTransfers]);

	const checkNewTokenTransfers = useCallback(async () => {
		/* istanbul ignore next -- @preserve */
		if (wallets.length === 0) {
			return;
		}

		const response = await fetchTokenTransfers({
			page: 1,
			wallets,
		});

		setState((state) => ({
			...state,
			hasMore: response.hasMorePages() as boolean,
			isLoadingMore: false,
			transfers: response.items(),
		}));
	}, [wallets, fetchTokenTransfers, transfers]);

	const walletAddresses = wallets.map((wallet) => wallet.address());
	const walletAddressesStr = walletAddresses.join("-");

	const jobs = useMemo(
		() => [
			{
				callback: checkNewTokenTransfers,
				interval: 15_000,
			},
		],
		[walletAddressesStr, transfers],
	);

	const { start, stop } = useSynchronizer(jobs);

	useEffect(() => {
		start();
		return () => stop();
	}, [start, stop]);

	const hasEmptyResults = useMemo(() => transfers.length === 0 && !isLoadingTransfers, [isLoadingTransfers, transfers.length]);

	return {
		fetchMore,
		hasEmptyResults,
		hasMore,
		isLoadingMore,
		isLoadingTransfers,
		setSortBy,
		sortBy,
		transfers,
	};
};
