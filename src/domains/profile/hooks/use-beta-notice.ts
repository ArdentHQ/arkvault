import { useState } from "react";

const HIDE_BETA_NOTICE_KEY = "hideBetaNotice";

export const useBetaNotice = () => {
	const [showBetaNotice, setShowBetaNotice] = useState<boolean>(!localStorage.getItem(HIDE_BETA_NOTICE_KEY));

	const acceptBetaNotice = () => {
		localStorage.setItem(HIDE_BETA_NOTICE_KEY, "true");

		setShowBetaNotice(false);
	};

	return {
		acceptBetaNotice,
		showBetaNotice,
	};
};
