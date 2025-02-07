import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useConfiguration, useEnvironmentContext } from "@/app/contexts";
import { DashboardConfiguration } from "@/domains/dashboard/pages/Dashboard";

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
	activeNetwork: Networks.Network | undefined;
	setActiveNetwork: (networkId: string) => Promise<void>;
} => {
	const environment = useEnvironmentContext();
	const { activeNetworkId, setConfiguration } = useConfiguration();
	const dashboardConfig = (profile
		.settings()
		.get(Contracts.ProfileSetting.DashboardConfiguration) as DashboardConfiguration) ?? {
		activeNetworkId: undefined,
	};

	const activeNetwork = profile.availableNetworks().find((network) => {
		if (dashboardConfig.activeNetworkId === network.id()) {
			return network;
		}

		if (activeNetworkId === network.id()) {
			return network;
		}

		// @TODO: Return mainnet as the default network once it will be available.
		return network.isTest();
	});

	const setActiveNetwork = async (activeNetworkId: string) => {
		const dashboardConfiguration = profile.settings().get(Contracts.ProfileSetting.DashboardConfiguration, {});
		profile
			.settings()
			.set(Contracts.ProfileSetting.DashboardConfiguration, { ...dashboardConfiguration, activeNetworkId });
		setConfiguration({ activeNetworkId });
		await environment.persist();
	};

	return {
		activeNetwork,
		setActiveNetwork,
	};
};
