import { BigNumber } from "@ardenthq/sdk-helpers";
import { Contracts } from "@ardenthq/sdk-profiles";
import { IProfile } from "@ardenthq/sdk-profiles/distribution/esm/profile.contract";
import { IReadWriteWallet } from "@ardenthq/sdk-profiles/distribution/esm/wallet.contract";
import { useEnvironmentContext } from "@/app/contexts";
import { DashboardConfiguration } from "@/domains/dashboard/pages/Dashboard";
import { Networks } from "@ardenthq/sdk";
import { useActiveNetwork } from "@/app/hooks/use-active-network";

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

export function SelectedAddresses({ profile, activeNetwork }: { profile: IProfile; activeNetwork: Networks.Network }) {
	return {
		/**
		 * Returns all the selected profile selected addresses.
		 *
		 * @returns {string[]}
		 */
		all(): string[] {
			const nethash = activeNetwork.meta().nethash

			const config = profile.settings().get(Contracts.ProfileSetting.DashboardConfiguration, {
				selectedAddresses: [],
				selectedAddressesByActiveNetwork: { [nethash]: [] }
			}) as unknown as DashboardConfiguration;

			if (!config.selectedAddressesByNetwork || !config.selectedAddressesByNetwork[nethash]) {
				return []
			}

			const selectedAddresses = config.selectedAddressesByNetwork[nethash]

			const profileAddresses = new Set(
				profile
					.wallets()
					.findByCoinWithNetwork(activeNetwork.coin(), activeNetwork.id())
					.values()
					.map((wallet) => wallet.address()),
			);

			console.log({ profileAddresses, selectedAddresses })

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
		set(selectedAddresses: string[]): void {
			const defaultConfig = { selectedAddressesByNetwork: { [activeNetwork.meta().nethash]: [] } }
			const nethash = activeNetwork.meta().nethash

			const config = profile.settings().get(Contracts.ProfileSetting.DashboardConfiguration, defaultConfig) as DashboardConfiguration;
			config.selectedAddressesByNetwork[nethash] = selectedAddresses

			profile.settings().set(Contracts.ProfileSetting.DashboardConfiguration, config);
		},
		/**
		 * Returns the selected addresses as wallets.
		 *
		 * @returns {IReadWriteWallet[]}
		 */
		toWallets(): IReadWriteWallet[] {
			const selected = this.all();

			return profile.wallets().findByCoinWithNetwork(activeNetwork.coin(), activeNetwork.id())
				.filter((wallet) => selected.includes(wallet.address()));
		},
	};
}

export const usePortfolio = ({ profile }: { profile: Contracts.IProfile }) => {
	const { persist } = useEnvironmentContext();
	const { activeNetwork } = useActiveNetwork({ profile })
	const addresses = SelectedAddresses({ activeNetwork, profile });
	const wallets = addresses.toWallets();
	const balance = Balance({ wallets });

	return {
		allWallets: profile.wallets().findByCoinWithNetwork(activeNetwork.coin(), activeNetwork.id()),
		balance,
		selectedAddresses: addresses.all(),
		selectedWallet: addresses.defaultSelectedWallet(),
		selectedWallets: wallets,
		setSelectedAddresses: async (selectedAddresses: string[]) => {
			addresses.set(selectedAddresses);

			if (!addresses.hasSelected() && profile.wallets().first()) {
				addresses.set([profile.wallets().first().address()]);
			}

			await persist()
		},
	};
};
