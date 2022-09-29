import { sortByDesc } from "@ardenthq/sdk-helpers";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useEffect, useMemo, useState } from "react";
import { assertString } from "@/utils/assertions";
import { AssetItem } from "@/domains/dashboard/components/PortfolioBreakdown/PortfolioBreakdown.contracts";
import { networkDisplayName } from "@/utils/network-utils";

type UsePortfolioBreakdownHook = (input: {
	profile: Contracts.IProfile;
	profileIsSyncingExchangeRates: boolean;
	selectedNetworkIds: string[];
}) => {
	assets: AssetItem[];
	balance: number;
	loading: boolean;
	ticker: string;
	walletsCount: number;
};

const getSyncStatus = (wallets: Contracts.IReadWriteWallet[]): boolean => {
	let synced = true;

	for (const wallet of wallets) {
		if (wallet.isCold()) {
			continue;
		}

		synced = synced && wallet.hasSyncedWithNetwork();

		if (!synced) {
			return false;
		}
	}

	return synced;
};

export const usePortfolioBreakdown: UsePortfolioBreakdownHook = ({
	profile,
	profileIsSyncingExchangeRates,
	selectedNetworkIds,
}) => {
	const [loading, setLoading] = useState(false);
	const [assets, setAssets] = useState<AssetItem[]>([]);
	const [balance, setBalance] = useState<number>(0);

	const isRestored = profile.status().isRestored();

	const isEmpty = assets.length === 0;

	const ticker = useMemo<string>(
		() => {
			if (!isRestored) {
				return "";
			}

			const exchangeCurrency = profile.settings().get<string>(Contracts.ProfileSetting.ExchangeCurrency);
			assertString(exchangeCurrency);

			return exchangeCurrency;
		},
		[profile, isRestored], // eslint-disable-line react-hooks/exhaustive-deps
	);

	const wallets = profile
		.wallets()
		.values()
		.filter((wallet) => {
			if (wallet.network().isTest()) {
				return false;
			}

			if (!selectedNetworkIds.includes(wallet.networkId())) {
				return false;
			}

			return true;
		});

	const allSynced = getSyncStatus(wallets);

	const walletIds = wallets
		.map((wallet) => wallet.id())
		.sort()
		.join(".");

	useEffect(() => {
		if (!walletIds) {
			setLoading(false);
			return;
		}

		if (!allSynced || !isRestored || (profileIsSyncingExchangeRates && isEmpty)) {
			setLoading(true);
			return;
		}

		const portfolioItems = sortByDesc(
			profile
				.portfolio()
				.breakdown({ networkIds: selectedNetworkIds })
				.map((asset) => ({
					amount: asset.source,
					convertedAmount: asset.target,
					displayName: networkDisplayName(asset.coin.network()),
					label: asset.coin.network().ticker(),
					percent: asset.shares,
				})),
			(asset) => asset.percent,
		);

		if (portfolioItems.some((asset) => Number.isNaN(asset.convertedAmount))) {
			setLoading(true);
			return;
		}

		let balance = 0;
		for (const item of portfolioItems) {
			balance += item.convertedAmount;
		}

		setBalance(balance);
		setAssets(portfolioItems);
		setLoading(false);
	}, [allSynced, isEmpty, isRestored, profile, profileIsSyncingExchangeRates, walletIds, selectedNetworkIds]);

	const walletsCount = useMemo(() => {
		if (!walletIds) {
			return 0;
		}

		return walletIds.split(".").length;
	}, [walletIds]);

	return {
		assets,
		balance,
		loading,
		ticker,
		walletsCount,
	};
};
