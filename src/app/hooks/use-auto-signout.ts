import { Contracts } from "@ardenthq/sdk-profiles";
import { useIdleTimer } from "react-idle-timer";
import {useLocation, useNavigate} from "react-router-dom";
import { useCallback } from "react";

export const useAutoSignOut = (profile?: Contracts.IProfile) => {
	const location = useLocation();
	const navigate = useNavigate();

	const timeout = 1000 * 60 * (profile?.settings().get(Contracts.ProfileSetting.AutomaticSignOutPeriod, 15) ?? 1);

	const onIdle = useCallback(() => {
		if (location.pathname === "/") {
			return;
		}

		navigate("/");
	}, [navigate, location]);

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
