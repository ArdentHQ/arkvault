import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useConfiguration } from "@/app/contexts";
import { ServerHealthStatus } from "@/domains/setting/pages/Servers/Servers.contracts";

export const useServerHealthStatus = () => {
	const { t } = useTranslation();
	const { serverStatus } = useConfiguration();

	const status = useMemo(() => {
		const getOverallStatus = (serverStatus: any) => {
			const statuses = Object.values(serverStatus);

			if (statuses.every((status) => status === ServerHealthStatus.Healthy)) {
				return ServerHealthStatus.Healthy;
			}

			if (statuses.includes(ServerHealthStatus.Downgraded)) {
				return ServerHealthStatus.Downgraded;
			}

			return ServerHealthStatus.Unavailable;
		};

		const getLabel = (overallStatus: ServerHealthStatus) => {
			if (overallStatus === ServerHealthStatus.Healthy) {
				return t("COMMON.SERVER_STATUS.HEALTHY");
			}

			if (overallStatus === ServerHealthStatus.Downgraded) {
				return t("COMMON.SERVER_STATUS.DOWNGRADED");
			}

			if (overallStatus === ServerHealthStatus.Unavailable) {
				return t("COMMON.SERVER_STATUS.UNAVAILABLE");
			}
		};

		const overallStatus = getOverallStatus(serverStatus ?? {});
		const label = getLabel(overallStatus);

		return {
			label,
			value: overallStatus,
		};
	}, [serverStatus]);

	return { status };
};
