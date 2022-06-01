import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useConfiguration } from "@/app/contexts";
import { ServerHealthStatus } from "@/domains/setting/pages/Servers/Servers.contracts";

export const useServerHealthStatus = () => {
	const { t } = useTranslation();
	const { serverStatus } = useConfiguration();

	const label = useMemo(() => {
		if (serverStatus === ServerHealthStatus.Healthy) {
			return t("COMMON.SERVER_STATUS.HEALTHY");
		}

		if (serverStatus === ServerHealthStatus.Downgraded) {
			return t("COMMON.SERVER_STATUS.DOWNGRADED");
		}

		if (serverStatus === ServerHealthStatus.Unavailable) {
			return t("COMMON.SERVER_STATUS.UNAVAILABLE");
		}
	}, [serverStatus]);

	return {
		status: {
			label,
			value: serverStatus,
		},
	};
};
