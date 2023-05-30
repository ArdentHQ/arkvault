import { Contracts } from "@ardenthq/sdk-profiles";
import { useMemo } from "react";

import { useConfiguration, useEnvironmentContext } from "@/app/contexts";
import { DashboardConfiguration } from "@/domains/dashboard/pages/Dashboard";
import { profileEnabledNetworkIds } from "@/utils/network-utils";
import { useNetworks } from "@/app/hooks";

export const useWalletConfig = ({
	profile,
	defaults,
}: {
	profile: Contracts.IProfile;
	defaults?: DashboardConfiguration;
}) => {
	const environment = useEnvironmentContext();

	const availableNetworks = useNetworks({ profile });

	const defaultConfiguration: DashboardConfiguration = {
		selectedNetworkIds: profileEnabledNetworkIds(profile),
		walletsDisplayType: "all",
		...defaults,
	};

	const { dashboard, setConfiguration } = useConfiguration();
	const profileDefaults = useMemo(
		() =>
			profile
				.settings()
				.get(Contracts.ProfileSetting.DashboardConfiguration, defaultConfiguration) as DashboardConfiguration,
		[profile, defaultConfiguration],
	);

	const dashboardConfiguration = dashboard || profileDefaults;

	const setValue = async (key: string, value: any) => {
		dashboardConfiguration[key] = value;

		setConfiguration({ dashboard: dashboardConfiguration });
		profile.settings().set(Contracts.ProfileSetting.DashboardConfiguration, dashboardConfiguration);
		await environment.persist();
	};

	const { selectedNetworkIds = [], walletsDisplayType } = dashboardConfiguration;

	const allWalletsLength = profile.wallets().values().length;
	const selectedWallets = useMemo(
		() =>
			profile
				.wallets()
				.values()
				.filter((wallet) => {
					if (!availableNetworks.some((network) => wallet.network().id() === network.id())) {
						return false;
					}

					if (!selectedNetworkIds.includes(wallet.network().id())) {
						return false;
					}

					if (walletsDisplayType === "starred") {
						return wallet.isStarred();
					}

					if (walletsDisplayType === "ledger") {
						return wallet.isLedger();
					}

					return true;
				}),
		[profile, dashboard, selectedNetworkIds, walletsDisplayType, allWalletsLength, availableNetworks], // eslint-disable-line react-hooks/exhaustive-deps
	);

	return {
		selectedWallets,
		setValue,
		...dashboardConfiguration,
		defaultConfiguration,
		selectedNetworkIds,
	};
};
