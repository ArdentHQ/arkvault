import { useEffect, useState } from "react";

export const useInputFocus = () => {
	const [isInputElementFocused, setIsInputElementFocused] = useState(false);

	const handleFocusIn = (event) => {
		if (!["textarea", "text", "password"].includes(event?.target?.type?.toLowerCase?.())) {
			return;
		}

		setIsInputElementFocused(true);
	};

	const handleFocusOut = (event) => {
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
