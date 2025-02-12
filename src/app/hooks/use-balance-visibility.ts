import { Contracts } from "@ardenthq/sdk-profiles";
import { useEnvironmentContext } from "@/app/contexts";
import { DashboardConfiguration } from "@/domains/dashboard/pages/Dashboard";

export const useBalanceVisibility = ({
	profile,
}: {
	profile?: Contracts.IProfile;
}): {
	hideBalance: boolean;
	setHideBalance: (hideBalance: boolean) => Promise<void>;
} => {
	const environment = useEnvironmentContext();

	const dashboardConfig = profile
		?.settings()
		.get(Contracts.ProfileSetting.DashboardConfiguration) as DashboardConfiguration;

	const hideBalance = dashboardConfig?.hideBalance ?? false;

	const setHideBalance = async (hideBalance: boolean) => {
		profile?.settings().set(Contracts.ProfileSetting.DashboardConfiguration, { ...dashboardConfig, hideBalance });
		await environment.persist();
	};

	return {
		hideBalance,
		setHideBalance,
	};
};
