import { BigNumber } from "@ardenthq/sdk-helpers";
import { Contracts, Environment } from "@ardenthq/sdk-profiles";
import { IProfile } from "@ardenthq/sdk-profiles/distribution/esm/profile.contract";
import { IReadWriteWallet } from "@ardenthq/sdk-profiles/distribution/esm/wallet.contract";
import { useConfiguration, useEnvironmentContext } from "@/app/contexts";
import { useEffect, useMemo } from "react";

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

function SelectedAddresses({ profile, env }: { profile: IProfile; env: Environment }) {
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

			return config.selectedAddresses ?? [];
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

			const wallets = profile
				.wallets()
				.values()
				.filter((wallet) => selected.includes(wallet.address()));

			if (wallets.length === 0) {
				// TODO: Define default active wallet none are selected.
				return [profile.wallets().first()];
			}

			return wallets;
		},
	};
}

export const usePortfolio = ({ profile }: { profile: Contracts.IProfile }) => {
	const { env } = useEnvironmentContext();
	const { selectedAddresses, setConfiguration } = useConfiguration();

	const addresses = SelectedAddresses({ env, profile });
	const wallets = addresses.toWallets();
	const balance = Balance({ wallets });
	const allAddresses = addresses.all()

	useEffect(() => {
		if (selectedAddresses.length === 0) {
			setConfiguration({ selectedAddresses: allAddresses })
		}
	}, [selectedAddresses, allAddresses])

	return {
		balance,
		selectedAddresses,
		selectedWallet: addresses.defaultSelectedWallet(),
		selectedWallets: wallets,
		setSelectedAddresses: async (selectedAddresses: string[]) => {
			await addresses.set(selectedAddresses);
			setConfiguration({ selectedAddresses });
		},
	};
};
