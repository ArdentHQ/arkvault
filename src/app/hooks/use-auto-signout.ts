import { Contracts } from "@payvo/sdk-profiles";
import { useIdleTimer } from "react-idle-timer";
import { useHistory } from "react-router-dom";
import { useCallback } from "react";

export const useAutoSignOut = (profile?: Contracts.IProfile) => {
	const history = useHistory();

	const idleTimeout = 1000 * 60 * (profile?.settings().get(Contracts.ProfileSetting.AutomaticSignOutPeriod, 15) ?? 0);

	const onIdle = useCallback(() => {
		if (history.location.pathname === "/") {
			return;
		}

		history.push("/");
	}, [history]);

	const { start, pause } = useIdleTimer({
		crossTab: {
			emitOnAllTabs: true,
		},
		debounce: 500,
		onIdle,
		startManually: true,
		stopOnIdle: false,
		timeout: idleTimeout,
	});

	if (!profile) {
		pause();
	}

	return {
		resetIdleTimer: pause,
		startIdleTimer: start,
	};
};
