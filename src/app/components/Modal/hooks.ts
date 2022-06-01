import { useCallback, useEffect, useMemo } from "react";
import { browser } from "@/utils/platform";

export const useModal = ({ isOpen, onClose }: { isOpen: boolean; onClose?: any }) => {
	const defaultOverflow = useMemo(() => (browser.supportsOverflowOverlay() ? "overlay" : "scroll"), []);

	useEffect(() => {
		document.body.style.overflowY = defaultOverflow;

		if (isOpen) {
			document.body.style.overflowY = "hidden";
		}

		return () => {
			document.body.style.overflowY = defaultOverflow;
		};
	}, [defaultOverflow, isOpen]);

	const onEscKey = useCallback(
		(event: KeyboardEvent) => {
			event.preventDefault();
			event.stopPropagation();
			if (event.key === "Escape") {
				onClose();
			}
		},
		[onClose],
	);

	useEffect(() => {
		if (isOpen) {
			document.addEventListener("keyup", onEscKey, false);
		} else {
			document.removeEventListener("keyup", onEscKey);
		}

		return () => {
			document.removeEventListener("keyup", onEscKey);
		};
	}, [isOpen, onEscKey]);
};
