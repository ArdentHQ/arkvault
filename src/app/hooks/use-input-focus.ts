import { useEffect, useState } from "react";
import { useBreakpoint } from "./use-breakpoint";

export const useInputFocus = () => {
	const [isInputElementFocused, setIsInputElementFocused] = useState(false);
	const { isXs, isSm } = useBreakpoint();

	const handleFocusIn = (event) => {
		if (!["textarea", "text", "password"].includes(event?.target?.type?.toLowerCase?.())) {
			return;
		}

		if (isXs || isSm) {
			event?.target?.scrollIntoView?.({ behavior: "smooth", block: "center" });
		}

		setIsInputElementFocused(true);
	};

	const handleFocusOut = () => {
		setIsInputElementFocused(false);
	};

	useEffect(() => {
		document.addEventListener("focusin", handleFocusIn);
		document.addEventListener("focusout", handleFocusOut);

		return () => {
			document.removeEventListener("focusin", handleFocusIn);
			document.removeEventListener("focusout", handleFocusOut);
		};
	}, []);

	return {
		isInputElementFocused,
	};
};
