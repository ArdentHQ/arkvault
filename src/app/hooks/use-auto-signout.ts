import { Contracts } from "@/app/lib/profiles";
import { useIdleTimer } from "react-idle-timer";
import { useLocation, useNavigate } from "react-router-dom";
import { useCallback } from "react";

export const useAutoSignOut = (profile?: Contracts.IProfile) => {
	const navigate = useNavigate();
	const location = useLocation();

	const timeout = 1000 * 60 * (profile?.settings().get(Contracts.ProfileSetting.AutomaticSignOutPeriod, 15) ?? 1);

	const onIdle = useCallback(() => {
		if (location.pathname === "/") {
			return;
		}

		navigate("/");
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
