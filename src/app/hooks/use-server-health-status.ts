import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useConfiguration } from "@/app/contexts";
import { ServerHealthStatus } from "@/domains/setting/pages/Servers/Servers.contracts";

export const useServerHealthStatus = () => {
	const { t } = useTranslation();
	const { serverStatus } = useConfiguration();

	// eslint-disable-next-line sonarjs/cognitive-complexity
	const status = useMemo(() => {
		const getOverallStatus = (serverStatus: any) => {
			const peersByNetwork = Object.values(serverStatus);

			let status: ServerHealthStatus | undefined;

			for (const peers of peersByNetwork) {
				if (Object.values(peers as any).every((isUp) => !isUp)) {
					return ServerHealthStatus.Unavailable;
				}

				if (Object.values(peers as any).some((isUp) => !isUp)) {
					status = ServerHealthStatus.Downgraded;
				}

				if (status === undefined) {
					status = ServerHealthStatus.Healthy;
				}
			}

			return status!;
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

		/* istanbul ignore next -- @preserve */
		const overallStatus = getOverallStatus(serverStatus ?? {});
		const label = getLabel(overallStatus);

		return {
			label,
			value: overallStatus,
		};
	}, [serverStatus]);

	return { status };
};
