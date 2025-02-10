import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useEnvironmentContext } from "@/app/contexts";
import { DashboardConfiguration } from "@/domains/dashboard/pages/Dashboard";
import { assertNetwork } from "@/utils/assertions";

export const useProfileNetworks = ({ profile }: { profile: Contracts.IProfile }): Networks.Network[] => {
	if (profile.status().isRestored()) {
		return profile.availableNetworks();
	}

	return [];
};

export const useActiveNetwork = ({
	profile,
}: {
	profile: Contracts.IProfile;
}): {
	activeNetwork: Networks.Network;
	setActiveNetwork: (networkId: string) => Promise<void>;
	resetToDefaults: () => Promise<void>;
} => {
	const environment = useEnvironmentContext();

	const dashboardConfig = (profile
		.settings()
		.get(Contracts.ProfileSetting.DashboardConfiguration) as DashboardConfiguration) ?? {
		activeNetworkId: undefined,
	};

	const activeNetwork = profile.availableNetworks().find((network) => {
		if (dashboardConfig.activeNetworkId === network.id()) {
			return network;
		}

		// @TODO: Return mainnet as the default network once it will be available.
		return network.isTest();
	});

	assertNetwork(activeNetwork);

	const setActiveNetwork = async (activeNetworkId: string) => {
		const dashboardConfiguration = profile.settings().get(Contracts.ProfileSetting.DashboardConfiguration, {});
		profile
			.settings()
			.set(Contracts.ProfileSetting.DashboardConfiguration, { ...dashboardConfiguration, activeNetworkId });

		await environment.persist();
	};

	const resetToDefaults = async () => {
		// @TODO: Change it to mainnet when available.
		const defaultNetwork = profile.availableNetworks().find(network => network.isTest())
		if (defaultNetwork) {
			await setActiveNetwork(defaultNetwork.id())
		}
	}

	return {
		activeNetwork,
		resetToDefaults,
		setActiveNetwork,
	};
};
