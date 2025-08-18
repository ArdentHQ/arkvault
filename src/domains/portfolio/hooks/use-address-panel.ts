import { useEffect, useState } from "react";

import { Contracts } from "@/app/lib/profiles";
import { DashboardConfiguration } from "@/domains/dashboard/pages/Dashboard";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { useEnvironmentContext } from "@/app/contexts";

export type AddressViewType = "single" | "multiple";

export interface AddressesPanelSettings {
	addressViewPreference: AddressViewType;
	singleSelectedAddress: string[];
	multiSelectedAddresses: string[];
}

export enum AddressViewSelection {
	single = "single",
	multiple = "multiple",
}

const defaultAddressSettings: AddressesPanelSettings = {
	addressViewPreference: AddressViewSelection.single,
	multiSelectedAddresses: [],
	singleSelectedAddress: [],
};

export const resetViewPreferences = (profile: Contracts.IProfile): void => {
	const config = profile.settings().get(Contracts.ProfileSetting.DashboardConfiguration, {
		addressPanelSettings: {},
	}) as unknown as DashboardConfiguration;

	if (!config.addressPanelSettings) {
		config.addressPanelSettings = defaultAddressSettings;
	}

	config.addressPanelSettings = {
		...config.addressPanelSettings,
		...defaultAddressSettings,
	};

	profile.settings().set(Contracts.ProfileSetting.DashboardConfiguration, config);

	profile.settings().set(Contracts.ProfileSetting.WalletSelectionMode, AddressViewSelection.single);
};

export const useAddressesPanel = ({ profile }: { profile: Contracts.IProfile }) => {
	const { persist, state } = useEnvironmentContext();
	const { activeNetwork } = useActiveNetwork({ profile });

	const getAddressPanelSettings = (): AddressesPanelSettings => {
		const config = profile.settings().get(Contracts.ProfileSetting.DashboardConfiguration, {
			addressPanelSettings: defaultAddressSettings,
		}) as unknown as DashboardConfiguration;

		if (!config.addressPanelSettings) {
			return defaultAddressSettings;
		}

		return config.addressPanelSettings;
	};

	const setAddressPanelSettings = async (settings: Partial<AddressesPanelSettings>): Promise<void> => {
		const config = profile.settings().get(Contracts.ProfileSetting.DashboardConfiguration, {
			addressPanelSettings: {},
		}) as unknown as DashboardConfiguration;

		if (!config.addressPanelSettings) {
			config.addressPanelSettings = defaultAddressSettings;
		}

		config.addressPanelSettings = {
			...config.addressPanelSettings,
			...settings,
		};

		profile.settings().set(Contracts.ProfileSetting.DashboardConfiguration, config);
		await persist();
	};

	const initialSettings = getAddressPanelSettings();
	const [addressViewPreference, setAddressViewPreferenceState] = useState<AddressViewType>(
		initialSettings.addressViewPreference || AddressViewSelection.single,
	);
	const [singleSelectedAddress, setSingleSelectedAddressState] = useState<string[]>(
		initialSettings.singleSelectedAddress || [],
	);
	const [multiSelectedAddresses, setMultiSelectedAddressesState] = useState<string[]>(
		initialSettings.multiSelectedAddresses || [],
	);

	// Sync local state with profile settings
	useEffect(() => {
		const settings = getAddressPanelSettings();
		setAddressViewPreferenceState(settings.addressViewPreference || AddressViewSelection.single);
		setSingleSelectedAddressState(settings.singleSelectedAddress || []);
		setMultiSelectedAddressesState(settings.multiSelectedAddresses || []);
	}, [profile.id(), activeNetwork.id(), state]);

	const setAddressViewPreference = async (preference: AddressViewType): Promise<void> => {
		setAddressViewPreferenceState(preference);
		await setAddressPanelSettings({ addressViewPreference: preference });
	};

	const setSingleSelectedAddress = async (addresses: string[]): Promise<void> => {
		setSingleSelectedAddressState(addresses);
		await setAddressPanelSettings({ singleSelectedAddress: addresses });
	};

	const setMultiSelectedAddresses = async (addresses: string[]): Promise<void> => {
		setMultiSelectedAddressesState(addresses);
		await setAddressPanelSettings({ multiSelectedAddresses: addresses });
	};

	const resetAddressPanelSettings = async (): Promise<void> => {
		resetViewPreferences(profile);

		await persist();
	};

	return {
		addressViewPreference,
		multiSelectedAddresses,
		resetAddressPanelSettings,
		setAddressViewPreference,
		setMultiSelectedAddresses,
		setSingleSelectedAddress,
		singleSelectedAddress,
	};
};
