import { useCallback, useEffect, useState } from "react";

export const beforeunloadEventListener = (event: BeforeUnloadEvent) => {
	event.preventDefault();

	// Chrome doesn't support `event.preventDefault()` on `BeforeUnloadEvent`,
	// instead it requires `event.returnValue` to be set
	// https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload#browser_compatibility
	if (event.defaultPrevented) {
		return (event.returnValue = "");
	}
};

export const useBeforeunload = () => {
	const [preventDefault, setPreventDefault] = useState(false);

	const addBeforeunload = useCallback(() => {
		setPreventDefault(true);
	}, []);

	const removeBeforeunload = useCallback(() => {
		setPreventDefault(false);
	}, []);

	useEffect(() => {
		if (preventDefault) {
			window.addEventListener("beforeunload", beforeunloadEventListener);
		} else {
			window.removeEventListener("beforeunload", beforeunloadEventListener);
		}

		return () => window.removeEventListener("beforeunload", beforeunloadEventListener);
	}, [preventDefault]);

	return { addBeforeunload, removeBeforeunload };
};
