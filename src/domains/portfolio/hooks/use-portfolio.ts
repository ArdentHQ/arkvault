import { BigNumber } from "@/app/lib/helpers";
import { Contracts } from "@/app/lib/profiles";
import { DashboardConfiguration } from "@/domains/dashboard/pages/Dashboard";
import { useEnvironmentContext } from "@/app/contexts";
import { AddressViewSelection, AddressViewType } from "@/domains/portfolio/hooks/use-address-panel";

function Balance({ wallets }: { wallets: Contracts.IReadWriteWallet[] }) {
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

export function SelectedAddresses({ profile }: { profile: Contracts.IProfile }) {
	return {
		/**
		 * Returns all the selected profile selected addresses.
		 *
		 * @returns {string[]}
		 */
		all(): string[] {
			const config = profile.settings().get(Contracts.ProfileSetting.DashboardConfiguration, {
				selectedAddresses: [],
			}) as unknown as DashboardConfiguration;

			if (!config.selectedAddresses) {
				return [];
			}

			const selectedAddresses = config.selectedAddresses;

			const profileAddresses = new Set(
				profile
					.wallets()
					.values()
					.map((wallet) => wallet.address()),
			);

			return selectedAddresses.filter((address) => profileAddresses.has(address));
		},

		/**
		 * Find the default selected wallet.
		 * Returns the first available wallet if profile hasn't stored any selection yet.
		 * Otherwise returns the first selection.
		 *
		 * @returns {IReadWriteWallet | undefined}
		 */
		defaultSelectedWallet(): Contracts.IReadWriteWallet | undefined {
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

		mode() {
			const config = profile.settings().get(Contracts.ProfileSetting.DashboardConfiguration, {
				selectedMode: AddressViewSelection.single,
			}) as unknown as DashboardConfiguration;

			if (!config.selectedMode) {
				return AddressViewSelection.single;
			}

			return config.selectedMode;
		},

		/**
		 * Sets a new address and persists the change.
		 *
		 * @param {string[]} selectedAddresses
		 * @returns {Promise<void>}
		 */
		set(selectedAddresses: string[]): void {
			const defaultConfig = { selectedAddresses: [] };

			const config = profile
				.settings()
				.get(
					Contracts.ProfileSetting.DashboardConfiguration,
					defaultConfig,
				) as unknown as DashboardConfiguration;

			if (!config.selectedAddresses) {
				config.selectedAddresses = [];
			}

			config.selectedAddresses = selectedAddresses;

			profile.settings().set(Contracts.ProfileSetting.DashboardConfiguration, config);
		},

		setMode(newMode: AddressViewType) {
			const config = profile.settings().get(Contracts.ProfileSetting.DashboardConfiguration, {
				selectedMode: AddressViewSelection.single,
			}) as unknown as DashboardConfiguration;

			config.selectedMode = newMode;
		},
		/**
		 * Returns the selected addresses as wallets.
		 *
		 * @returns {IReadWriteWallet[]}
		 */
		toWallets(): Contracts.IReadWriteWallet[] {
			const selected = this.all();

			return profile
				.wallets()
				.values()
				.filter((wallet) => selected.includes(wallet.address()));
		},
	};
}

export const usePortfolio = ({ profile }: { profile: Contracts.IProfile }) => {
	const { persist } = useEnvironmentContext();
	const addresses = SelectedAddresses({ profile });
	const wallets = addresses.toWallets();
	const balance = Balance({ wallets });

	return {
		allWallets: profile.wallets().values(),
		balance,
		mode: addresses.mode(),
		removeSelectedAddresses: async (selectedAddresses: string[]) => {
			const selected = SelectedAddresses({ profile });

			const updated = selected.all().filter((address) => !selectedAddresses.includes(address));

			addresses.set(updated);

			if (!addresses.hasSelected() && profile.wallets().first()) {
				addresses.set([profile.wallets().first().address()]);
			}

			await persist();
		},
		selectedAddresses: addresses.all(),
		selectedWallet: addresses.defaultSelectedWallet(),
		selectedWallets: wallets,
		setMode: async (mode: AddressViewType) => {
			addresses.setMode(mode);
			await persist();
		},
		setSelectedAddresses: async (selectedAddresses: string[]) => {
			addresses.set(selectedAddresses);

			if (!addresses.hasSelected() && profile.wallets().first()) {
				addresses.set([profile.wallets().first().address()]);
			}

			await persist();
		},
	};
};
