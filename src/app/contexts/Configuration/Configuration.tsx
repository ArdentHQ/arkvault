import React from "react";

import { ARK } from "@ardenthq/sdk-ark";
import { Mainsail } from "@ardenthq/sdk-mainsail";

interface ConfigurationContextType {
	configuration: Record<string, any>;
	setConfiguration: (configuration: Record<string, any>) => void;
}

interface Properties {
	children: React.ReactNode;
	defaultConfiguration?: any;
}

const ConfigurationContext = React.createContext<any>(undefined);

const defaultServerStatus = () => {
	const status = {};

	const allNetworks = [...Object.entries(ARK.manifest.networks), ...Object.entries(Mainsail.manifest.networks)];

	for (const [network, networkConfiguration] of allNetworks) {
		const fullHost = networkConfiguration.hosts.find((host) => host.type === "full");
		status[network] = { [fullHost!.host]: true };
	}

	return status;
};

export const ConfigurationProvider = ({ children, defaultConfiguration }: Properties) => {
	const [configuration, setConfig] = React.useState<any>({
		// Domain specific configuration defaults
		dashboard: undefined,

		isProfileInitialSync: true,

		// Errored networks names after a failed sync.
		profileErroredNetworks: [],

		profileHasSyncedOnce: false,

		profileIsRestoring: false,

		// Initial sync state of profile. Handled in profile synchronizer.
		profileIsSyncing: true,

		// Separate flag for exchange rate sync status. Updated by profile sync exchange job.
		profileIsSyncingExchangeRates: false,

		profileIsSyncingWallets: false,
		restoredProfiles: [],
		serverStatus: defaultServerStatus(),
		...defaultConfiguration,
	});

	const setConfiguration = (config: any) => {
		setConfig((latestConfig: any) => ({ ...latestConfig, ...config }));
	};

	return (
		<ConfigurationContext.Provider value={{ ...configuration, setConfiguration } as ConfigurationContextType}>
			{children}
		</ConfigurationContext.Provider>
	);
};

export const useConfiguration = () => {
	const value = React.useContext(ConfigurationContext);
	if (value === undefined) {
		throw new Error("[useConfiguration] Component not wrapped within a Provider");
	}
	return value;
};
