import { useEffect, useState } from "react";

import { AddressViewSelection } from "@/domains/portfolio/components/AddressesSidePanel";
import { Contracts } from "@ardenthq/sdk-profiles";
import { DashboardConfiguration } from "@/domains/dashboard/pages/Dashboard";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { useEnvironmentContext } from "@/app/contexts";

export type AddressViewType = "single" | "multiple";

export interface AddressesPanelSettings {
	addressViewPreference: AddressViewType;
	singleSelectedAddress: string[];
	multiSelectedAddresses: string[];
}

export const useAddressesPanel = ({ profile }: { profile: Contracts.IProfile }) => {
	const { persist } = useEnvironmentContext();
	const { activeNetwork } = useActiveNetwork({ profile });

	const getAddressPanelSettings = (): AddressesPanelSettings => {
		const defaultSettings: AddressesPanelSettings = {
			addressViewPreference: AddressViewSelection.multiple,
			singleSelectedAddress: [],
			multiSelectedAddresses: [],
		};

		const config = profile.settings().get(Contracts.ProfileSetting.DashboardConfiguration, {
			addressPanelSettings: defaultSettings,
		}) as unknown as DashboardConfiguration;

		if (!config.addressPanelSettings) {
			return defaultSettings;
		}

		return config.addressPanelSettings;
	};

	const setAddressPanelSettings = async (settings: Partial<AddressesPanelSettings>): Promise<void> => {
		const config = profile.settings().get(Contracts.ProfileSetting.DashboardConfiguration, {
			addressPanelSettings: {},
		}) as unknown as DashboardConfiguration;

		if (!config.addressPanelSettings) {
			config.addressPanelSettings = {
				addressViewPreference: AddressViewSelection.multiple,
				singleSelectedAddress: [],
				multiSelectedAddresses: [],
			};
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
		initialSettings.addressViewPreference || AddressViewSelection.multiple,
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
		setAddressViewPreferenceState(settings.addressViewPreference || AddressViewSelection.multiple);
		setSingleSelectedAddressState(settings.singleSelectedAddress || []);
		setMultiSelectedAddressesState(settings.multiSelectedAddresses || []);
	}, [profile, activeNetwork]);

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

	return {
		addressViewPreference,
		singleSelectedAddress,
		multiSelectedAddresses,
		setAddressViewPreference,
		setSingleSelectedAddress,
		setMultiSelectedAddresses,
	};
};
