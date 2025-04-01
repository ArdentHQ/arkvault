import React from "react";
import { ARK } from "@ardenthq/sdk-ark";
import { Mainsail } from "@ardenthq/sdk-mainsail";

interface ConfigurationContextType {
	configuration: Record<string, Record<string, any>>;
	setConfiguration: (profileId: string, configuration: Record<string, any>) => void;
	getProfileConfiguration: (profileId: string | undefined) => Record<string, any>;
}

interface Properties {
	children: React.ReactNode;
	defaultConfiguration?: Record<string, any>;
}

const ConfigurationContext = React.createContext<ConfigurationContextType | undefined>(undefined);

const defaultServerStatus = () => {
	const status = {};
	const allNetworks = [...Object.entries(ARK.manifest.networks), ...Object.entries(Mainsail.manifest.networks)];

	for (const [network, networkConfiguration] of allNetworks) {
		const fullHost = networkConfiguration.hosts.find((host) => host.type === "full");
		status[network] = { [fullHost!.host]: true };
	}

	return status;
};

const getDefaultProfileConfig = (defaultConfiguration?: Record<string, any>) => ({
	dashboard: undefined,
	isProfileInitialSync: true,
	profileErroredNetworks: [],
	profileHasSyncedOnce: false,
	profileIsRestoring: false,
	profileIsSyncing: true,
	profileIsSyncingExchangeRates: false,
	profileIsSyncingWallets: false,
	restoredProfiles: [],
	selectedAddresses: [],
	serverStatus: defaultServerStatus(),
	...defaultConfiguration,
});

export const ConfigurationProvider = ({ children, defaultConfiguration }: Properties) => {
	const [configuration, setConfig] = React.useState<Record<string, Record<string, any>>>({});

	const setConfiguration = (profileId: string, config: Record<string, any>) => {
		setConfig((latestConfig) => ({
			...latestConfig,
			[profileId]: {
				...(latestConfig[profileId] || getDefaultProfileConfig(defaultConfiguration)),
				...config,
			},
		}));
	};

	const getProfileConfiguration = (profileId?: string): Record<string, any> => {
		if (!profileId) {
			return {};
		}

		return (
			configuration[profileId] || {
				...getDefaultProfileConfig(defaultConfiguration),
			}
		);
	};

	const contextValue: ConfigurationContextType = {
		configuration,
		getProfileConfiguration,
		setConfiguration,
	};

	return <ConfigurationContext.Provider value={contextValue}>{children}</ConfigurationContext.Provider>;
};

export const useConfiguration = () => {
	const value = React.useContext(ConfigurationContext);
	if (value === undefined) {
		throw new Error("[useConfiguration] Component not wrapped within a Provider");
	}
	return value;
};
