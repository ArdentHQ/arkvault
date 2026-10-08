import { useEffect, useRef, useState } from "react";
import { useBreakpoint } from "./use-breakpoint";
import { delay } from "@/utils/delay";

export const useInputFocus = () => {
	const [isInputElementFocused, setIsInputElementFocused] = useState(false);
	const scrollTimeout = useRef<ReturnType<typeof delay>>(undefined);
	const focusOutTimeout = useRef<ReturnType<typeof delay>>(undefined);
	const { isXs, isSm } = useBreakpoint();

	const handleFocusIn = (event) => {
		if (!["textarea", "text", "password"].includes(event?.target?.type?.toLowerCase?.())) {
			return;
		}

		if (isXs || isSm) {
			clearTimeout(scrollTimeout.current);
			scrollTimeout.current = delay(() => {
				event?.target?.scrollIntoView?.({ behavior: "smooth", block: "center" });
			}, 500);
		}

		setIsInputElementFocused(true);
	};

	const handleFocusOut = () => {
		clearTimeout(focusOutTimeout.current);
		focusOutTimeout.current = delay(() => setIsInputElementFocused(false), 300);
	};

	useEffect(() => {
		document.addEventListener("focusin", handleFocusIn);
		document.addEventListener("focusout", handleFocusOut);

		return () => {
			document.removeEventListener("focusin", handleFocusIn);
			document.removeEventListener("focusout", handleFocusOut);

			clearTimeout(scrollTimeout.current);
			clearTimeout(focusOutTimeout.current);
		};
	}, []);

	return {
		isInputElementFocused,
	};
};
