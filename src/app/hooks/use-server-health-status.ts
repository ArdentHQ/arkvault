import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useConfiguration } from "@/app/contexts";
import { ServerHealthStatus } from "@/domains/setting/pages/Servers/Servers.contracts";

export const useServerHealthStatus = () => {
	const { t } = useTranslation();
	const { serverStatus } = useConfiguration();

	const overallStatus = useMemo(() => {
		const statuses = Object.values(serverStatus);

		console.log(statuses);

		if (statuses.every((status) => status === ServerHealthStatus.Healthy)) {
			return ServerHealthStatus.Healthy;
		}

		if (statuses.some((status) => status === ServerHealthStatus.Downgraded)) {
			return ServerHealthStatus.Downgraded;
		}

		return ServerHealthStatus.Unavailable;
	}, [serverStatus]);

	const label = useMemo(() => {
		if (overallStatus === ServerHealthStatus.Healthy) {
			return t("COMMON.SERVER_STATUS.HEALTHY");
		}

		if (overallStatus === ServerHealthStatus.Downgraded) {
			return t("COMMON.SERVER_STATUS.DOWNGRADED");
		}

		if (overallStatus === ServerHealthStatus.Unavailable) {
			return t("COMMON.SERVER_STATUS.UNAVAILABLE");
		}
	}, [overallStatus]);

	return {
		status: {
			label,
			value: overallStatus,
		},
	};
};
