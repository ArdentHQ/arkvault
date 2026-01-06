import { Contracts, Contracts as ProfileContracts } from "@/app/lib/profiles";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSynchronizer } from "@/app/hooks";
import { SortBy } from "@/app/components/Table";
import { delay } from "@/utils/delay";
import { TokenAddressesQuery } from "@/app/lib/mainsail/client.contract";
import { TokenAddressesDTO } from "@/app/lib/profiles/token-addresses.dto";

interface TokensState {
	tokens: TokenAddressesDTO[];
	isLoadingTokens: boolean;
	isLoadingMore: boolean;
	hasMore?: boolean;
}

interface FetchTokenProperties {
	wallets: ProfileContracts.IReadWriteWallet[];
	page?: number;
	orderBy?: string;
}

interface ProfileTokensProperties {
	profile: Contracts.IProfile;
	wallets: Contracts.IReadWriteWallet[];
	limit?: number;
	orderBy?: string;
}

export const useProfileTokens = ({ profile, wallets, limit = 30 }: ProfileTokensProperties) => {
	const currentPage = useRef(1);

	const [sortBy, setSortBy] = useState<SortBy>({ column: "date", desc: true });

	const orderBy = sortBy; // format sortBy based on API needs

	const [
		{ tokens, isLoadingTokens, isLoadingMore, hasMore },
		setState,
	] = useState<TokensState>({
		hasMore: true,
		isLoadingMore: false,
		isLoadingTokens: true,
		tokens: [],
	});

	const selectedWalletAddresses = wallets.map((wallet) => wallet.address()).join("-");

	useEffect(() => {
		const loadTokens = async () => {
			try {
				const response = await fetchTokens({
					wallets,
				});

				setState((state) => ({
					...state,
					hasMore: response.hasMorePages() as boolean,
					isLoadingTokens: false,
					tokens: response.items(),
				}));
			} catch (error) {
				console.error({ error });
			}
		};

		delay(() => loadTokens(), 0);
	}, [selectedWalletAddresses, orderBy]);

	const fetchTokens = useCallback(
		async ({ wallets }: FetchTokenProperties) => {
			if (wallets.length === 0) {
				return { hasMorePages: () => false, items: () => [] };
			}

			const queryParameters: TokenAddressesQuery = {
				addresses: wallets.map((wallet) => wallet.address()),
				// limit,
				// orderBy,
			};

			return profile.tokens().tokenAddresses(queryParameters);
		},
		[limit, orderBy, profile],
	);

	const fetchMore = useCallback(async () => {
		currentPage.current = currentPage.current + 1;
		setState((state) => ({ ...state, isLoadingMore: true }));

		const response = await fetchTokens({
			page: currentPage.current,
			wallets,
		});

		setState((state) => ({
			...state,
			hasMore: response.hasMorePages() as boolean,
			isLoadingMore: false,
			tokens: [...state.tokens, ...response.items()],
		}));
	}, [wallets, fetchTokens]);

	const checkNewTokens = useCallback(async () => {
		/* istanbul ignore next -- @preserve */
		if (wallets.length === 0) {
			return;
		}

		const response = await fetchTokens({
			// page: 1,
			wallets,
		});

		setState((state) => ({
			...state,
			hasMore: response.hasMorePages() as boolean,
			isLoadingMore: false,
			tokens: response.items(),
		}));
	}, [wallets, fetchTokens, tokens]);

	const walletAddresses = wallets.map((wallet) => wallet.address());
	const walletAddressesStr = walletAddresses.join("-");

	const jobs = useMemo(
		() => [
			{
				callback: checkNewTokens,
				interval: 15_000,
			},
		],
		[walletAddressesStr, tokens],
	);

	const { start, stop } = useSynchronizer(jobs);

	useEffect(() => {
		start();
		return () => stop();
	}, [start, stop]);

	const hasEmptyResults = useMemo(() => {
		return tokens.length === 0 && !isLoadingTokens;
	}, [isLoadingTokens, tokens.length]);

	return {
		fetchMore,
		hasEmptyResults,
		hasMore,
		isLoadingMore,
		isLoadingTokens,
		setSortBy,
		sortBy,
		tokens,
	};
};
