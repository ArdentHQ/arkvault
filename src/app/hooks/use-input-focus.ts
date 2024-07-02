import { useEffect, useState } from "react";

import { delay } from "@/utils/delay";

import { useBreakpoint } from "./use-breakpoint";

export const useInputFocus = () => {
	const [isInputElementFocused, setIsInputElementFocused] = useState(false);
	const { isXs, isSm } = useBreakpoint();

	const handleFocusIn = (event) => {
		if (!["textarea", "text", "password"].includes(event?.target?.type?.toLowerCase?.())) {
			return;
		}

		if (isXs || isSm) {
			delay(() => {
				event?.target?.scrollIntoView?.({ behavior: "smooth", block: "center" });
			}, 500);
		}

		setIsInputElementFocused(true);
	};

	const handleFocusOut = () => {
		delay(() => setIsInputElementFocused(false), 300);
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
