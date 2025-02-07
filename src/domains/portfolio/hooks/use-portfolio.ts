import { BigNumber, isEqual } from "@ardenthq/sdk-helpers";
import { Contracts, Environment } from "@ardenthq/sdk-profiles";
import { IProfile } from "@ardenthq/sdk-profiles/distribution/esm/profile.contract";
import { IReadWriteWallet } from "@ardenthq/sdk-profiles/distribution/esm/wallet.contract";
import { useConfiguration, useEnvironmentContext } from "@/app/contexts";
import { useEffect } from "react";
import { DashboardConfiguration } from "@/domains/dashboard/pages/Dashboard";

interface PortfolioConfiguration {
	selectedAddresses: string[];
}

function Balance({ wallets }: { wallets: IReadWriteWallet[] }) {
	return {
		total(): BigNumber {
			let balance = BigNumber.make(0);
			for (const wallet of wallets) {
				balance = balance.plus(wallet.balance());
			}

			return balance;
		},
		totalConverted(): BigNumber {
			let balance = BigNumber.make(0);
			for (const wallet of wallets) {
				balance = balance.plus(wallet.convertedBalance());
			}

			return balance;
		},
	};
}

export function SelectedAddresses({ profile, env }: { profile: IProfile; env: Environment }) {
	return {
		/**
		 * Returns all the selected profile selected addresses.
		 *
		 * @returns {string[]}
		 */
		all(): string[] {
			const config = profile.settings().get(Contracts.ProfileSetting.DashboardConfiguration, {
				selectedAddresses: [],
			}) as PortfolioConfiguration;

			const selectedAddresses = config.selectedAddresses ?? [];
			const addressesByActiveNetwork = this.filterByActiveNetwork(profile.wallets().values())
			const profileAddresses = new Set(addressesByActiveNetwork.map((wallet) => wallet.address()));

			return selectedAddresses.filter((address) => profileAddresses.has(address));
		},

		/**
		 * Find the default selected wallet.
		 * Returns the first available wallet if profile hasn't stored any selection yet.
		 * Otherwise returns the first selection.
		 *
		 * @returns {IReadWriteWallet | undefined}
		 */
		defaultSelectedWallet(): IReadWriteWallet | undefined {
			if (profile.wallets().count() === 1) {
				return profile.wallets().first();
			}

			if (this.all().length === 0) {
				return profile.wallets().first();
			}

			return this.toWallets().at(0);
		},
		filterByActiveNetwork(wallets: Contracts.IReadWriteWallet[]) {
			const { activeNetworkId } = (profile.settings().get(Contracts.ProfileSetting.DashboardConfiguration) as DashboardConfiguration) ?? { activeNetworkId: undefined };

			if (!activeNetworkId) {
				return wallets
			}

			return wallets.filter(wallet => wallet.network().id() === activeNetworkId)
		},
		/**
		 * Determines whether the profile has a selected address.
		 *
		 * @returns {boolean}
		 */
		hasSelected(): boolean {
			return this.all().length > 0;
		},
		/**
		 * Sets a new address and persists the change.
		 *
		 * @param {string[]} selectedAddresses
		 * @returns {Promise<void>}
		 */
		async set(selectedAddresses: string[]): Promise<void> {
			profile.settings().set(Contracts.ProfileSetting.DashboardConfiguration, { selectedAddresses });
			await env.persist();
		},
		/**
		 * Returns the selected addresses as wallets.
		 *
		 * @returns {IReadWriteWallet[]}
		 */
		toWallets(): IReadWriteWallet[] {
			const selected = this.all();
			const walletsByNetwork = this.filterByActiveNetwork(profile.wallets().values())

			return walletsByNetwork.filter((wallet) => selected.includes(wallet.address()));
		},
	};
}

export const usePortfolio = ({ profile }: { profile: Contracts.IProfile }) => {
	const { env } = useEnvironmentContext();
	const { selectedAddresses, setConfiguration } = useConfiguration();

	const addresses = SelectedAddresses({ env, profile });
	const wallets = addresses.toWallets();
	const balance = Balance({ wallets });
	const allAddresses = addresses.all();

	useEffect(() => {
		if (selectedAddresses.length === 0 && !isEqual(selectedAddresses, allAddresses)) {
			setConfiguration({ selectedAddresses: allAddresses });
		}
	}, [selectedAddresses, allAddresses]);


	return {
		allWallets: addresses.filterByActiveNetwork(profile.wallets().values()),
		balance,
		selectedAddresses: selectedAddresses.filter(selectedAddress => {
			const addressesByNetwork = wallets.map(wallet => wallet.address())
			return addressesByNetwork.includes(selectedAddress)
		}),
		selectedWallet: addresses.defaultSelectedWallet(),
		selectedWallets: wallets,
		setSelectedAddresses: async (selectedAddresses: string[]) => {
			await addresses.set(selectedAddresses);

			if (!addresses.hasSelected() && profile.wallets().first()) {
				await addresses.set([profile.wallets().first().address()]);
			}

			setConfiguration({ selectedAddresses: addresses.all() });
		},
	};
};
