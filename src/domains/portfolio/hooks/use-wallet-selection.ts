import { useState } from "react";
import { Contracts } from "@/app/lib/profiles";
import { ProfileSetting } from "@/app/lib/profiles/profile.enum.contract";
import { IReadWriteWallet } from "@/app/lib/profiles/wallet.contract";
import { useEnvironmentContext } from "@/app/contexts";
import { AddressViewType, AddressViewSelection } from "@/app/lib/profiles/wallet.enum";

export const useWalletSelection = (profile: Contracts.IProfile) => {
	const { persist } = useEnvironmentContext();

	// We only persist when `persistSelection` is explicitly called, or when we delete a wallet.
	const [activeMode, setActiveMode] = useState<AddressViewType>(profile.walletSelectionMode());
	const [selectedAddresses, setSelectedAddresses] = useState<string[]>(
		profile
			.wallets()
			.selected()
			.map((wallet) => wallet.address()),
	);

	const isWalletSelected = (wallet: IReadWriteWallet) => selectedAddresses.includes(wallet.address());

	/**
	 * Deletes a wallet from the profile,
	 * resets the selection if necessary, and persists the changes.
	 *
	 * @param {IReadWriteWallet} wallet - The wallet to be deleted.
	 * @returns {Promise<void>}
	 */
	const handleDelete = async (wallet: IReadWriteWallet): Promise<void> => {
		setSelectedAddresses(
			profile
				.wallets()
				.selected()
				.map((wallet) => wallet.address()),
		);

		profile.wallets().forget(wallet.id());
		profile.notifications().transactions().forgetByRecipient(wallet.address());

		// Reset to single mode if profile has less than 2 wallets.
		if (profile.wallets().count() <= 1) {
			profile.settings().set(Contracts.ProfileSetting.WalletSelectionMode, AddressViewSelection.single);
			setActiveMode(AddressViewSelection.single);
		}

		if (profile.wallets().selected().length === 0) {
			profile.wallets().selectOne(profile.wallets().first());
		}

		setSelectedAddresses(
			profile
				.wallets()
				.selected()
				.map((wallet) => wallet.address()),
		);

		await persist();
	};

	/**
	 * Persists the current wallet selection and active mode to the profile settings.
	 *
	 * @param {string[]} selected - An array of addresses of the selected wallets.
	 * @returns {Promise<void>}
	 */
	const persistSelection = async (selected: string[]) => {
		profile.settings().set(ProfileSetting.WalletSelectionMode, activeMode);

		for (const wallet of profile.wallets().values()) {
			wallet.mutator().isSelected(selected.includes(wallet.address()));
		}

		await persist();
	};

	/**
	 * Toggles the selection of a specific wallet based on the current selection mode.
	 *
	 * @param {IReadWriteWallet} wallet - The wallet to be toggled.
	 * @returns {string[]} The new array of selected wallet addresses.
	 */
	const toggleSelection = (wallet: IReadWriteWallet): string[] => {
		const isSelected = isWalletSelected(wallet);

		// Select
		if (!isSelected) {
			const isSingleMode = profile.walletSelectionMode() === "single";
			const newSelection = isSingleMode ? [wallet.address()] : [...selectedAddresses, wallet.address()];
			setSelectedAddresses(newSelection);
			return newSelection;
		}

		// All are deselected. Select the single wallet.
		if (selectedAddresses.length === 0) {
			profile.wallets().selectOne(wallet);
			const addresses = profile
				.wallets()
				.selected()
				.map((wallet) => wallet.address());
			setSelectedAddresses(addresses);
			return addresses;
		}

		// Deselect
		const rest = selectedAddresses.filter((address) => address !== wallet.address());
		// Trigger warning for minimum selection if rest.length === 0
		setSelectedAddresses(rest);
		return rest;
	};

	return {
		activeMode,
		handleDelete,
		persistSelection,
		selectedAddresses,
		setActiveMode,
		setSelectedAddresses,
		toggleSelection,
	};
};
