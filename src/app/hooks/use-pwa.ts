import { useCallback, useEffect, useMemo, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { usePlatform } from "@/app/hooks/use-platform";
import { isE2E } from "@/utils/test-helpers";

const HIDE_PWA_INSTALL_ALERT = "hidePwaInstallAlert";

export const usePwa = () => {
	const { isIos, isWebapp } = usePlatform();
	const [alertEnabled, setAlertEnabled] = useState<boolean>(!localStorage.getItem(HIDE_PWA_INSTALL_ALERT));
	const [deferredPrompt, setDeferredPrompt] = useState<any>();
	const [showBanner, setShowInstallBanner] = useState(isIos() && !isWebapp());
	const [showIOSInstructions, setShowIOSInstructions] = useState(false);

	// @README: For options see: https://vite-plugin-pwa.netlify.app/frameworks/react.html#react
	useRegisterSW();

	const dontAskAgain = () => {
		localStorage.setItem(HIDE_PWA_INSTALL_ALERT, "true");

		setAlertEnabled(false);
	};

	const hideInstallBanner = useCallback(() => {
		setShowInstallBanner(false);

		dontAskAgain();
	}, []);

	const installPrompt = async () => {
		if (isIos()) {
			setShowIOSInstructions(true);
			hideInstallBanner();
			return;
		}

		await deferredPrompt.prompt();
		// @TODO: Show a warning if outcome !== accepted? in const { outcome } = await deferredPrompt.userChoice;
		await deferredPrompt.userChoice;
		hideInstallBanner();
	};

	useEffect(() => {
		window.addEventListener("beforeinstallprompt", (event: any) => {
			// Prevents the default mini-infobar or install dialog from appearing on mobile
			event.preventDefault();
			// Save the event because you'll need to trigger it later.
			setDeferredPrompt(event);

			setShowInstallBanner(true);
		});
	}, []);

	const isRunningE2E = isE2E();
	const showInstallBanner = useMemo(
		() => alertEnabled && showBanner && !isRunningE2E,
		[alertEnabled, showBanner, isRunningE2E],
	);

	return {
		hideInstallBanner,
		installPrompt,
		setShowIOSInstructions,
		showIOSInstructions,
		showInstallBanner,
	};
};
