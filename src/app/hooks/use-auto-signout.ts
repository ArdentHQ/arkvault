import { Contracts } from "@ardenthq/sdk-profiles";
import { useIdleTimer } from "react-idle-timer";
import { useHistory } from "react-router-dom";
import { useCallback } from "react";

export const useAutoSignOut = (profile?: Contracts.IProfile) => {
	const history = useHistory();

	const idleTimeout = 1000 * 60 * (profile?.settings().get(Contracts.ProfileSetting.AutomaticSignOutPeriod, 15) ?? 1);

	const onIdle = useCallback(() => {
		if (history.location.pathname === "/") {
			return;
		}

		history.push("/");
	}, [history]);

	const { start, pause } = useIdleTimer({
		onIdle,
		timeout: idleTimeout,
		debounce: 500,
		startManually: true,
		stopOnIdle: false,
		crossTab: true,
	});

	if (!profile) {
		pause();
	}

	return {
		resetIdleTimer: pause,
		startIdleTimer: start,
	};
};
