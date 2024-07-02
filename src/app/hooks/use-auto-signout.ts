import { Contracts } from "@ardenthq/sdk-profiles";
import { useCallback } from "react";
import { useIdleTimer } from "react-idle-timer";
import { useHistory } from "react-router-dom";

export const useAutoSignOut = (profile?: Contracts.IProfile) => {
	const history = useHistory();

	const timeout = 1000 * 60 * (profile?.settings().get(Contracts.ProfileSetting.AutomaticSignOutPeriod, 15) ?? 1);

	const onIdle = useCallback(() => {
		if (history.location.pathname === "/") {
			return;
		}

		history.push("/");
	}, [history]);

	const { start, pause } = useIdleTimer({
		crossTab: true,
		debounce: 500,
		onIdle,
		startManually: true,
		stopOnIdle: false,
		timeout,
	});

	if (!profile) {
		pause();
	}

	return {
		resetIdleTimer: pause,
		startIdleTimer: start,
	};
};
