const isInWebAppiOS = () => (window.navigator as any)?.standalone === true;
const isInWebAppChrome = () => window.matchMedia("(display-mode: standalone)").matches;

export const usePlatform = () => ({
	isIos: () => Boolean(/iphone|ipad|ipod/i.test(navigator.userAgent)),
	isWebapp: () => isInWebAppiOS() || isInWebAppChrome(),
});
