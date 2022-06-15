import { Environment } from "@ardenthq/sdk-profiles";
import React from "react";

import { isE2E } from "@/utils/test-helpers";

interface Context {
	env: Environment;
	state?: Record<string, unknown>;
	persist: () => Promise<void>;
	isEnvironmentBooted: boolean;
	setIsEnvironmentBooted: (isBooted: boolean) => void;
}

interface Properties {
	children: React.ReactNode;
	env: Environment;
}

export const EnvironmentContext = React.createContext<any>(undefined);

export const EnvironmentProvider = ({ children, env }: Properties) => {
	const [state, setState] = React.useState<any>(undefined);
	const [isEnvironmentBooted, setIsEnvironmentBooted] = React.useState(false);

	const persist = React.useCallback(async () => {
		if (isE2E()) {
			// prevent from persisting when in e2e mode. Tests failing
			setState({});
			return;
		}

		await env.persist();

		// Force update
		setState({});
	}, [env]);

	return (
		<EnvironmentContext.Provider
			value={{ env, isEnvironmentBooted, persist, setIsEnvironmentBooted, state } as Context}
		>
			{children}
		</EnvironmentContext.Provider>
	);
};

/**
 * If you needs to react to changes in the environment state
 * use the `state` field that will be updated whenever env.persist() is called:
 *
 * const context = useEnvironmentContext();
 * const profiles = React.useMemo(() => context.env.profiles().values(), [context]);
 */

export const useEnvironmentContext = (): Context => {
	const value = React.useContext(EnvironmentContext);
	if (value === undefined) {
		throw new Error("[useEnvironment] Component not wrapped within a Provider");
	}
	return value;
};
