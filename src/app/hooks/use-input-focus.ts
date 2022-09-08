import { useEffect, useState } from "react";

export const useInputFocus = () => {
	const [isInputElementFocused, setIsInputElementFocused] = useState(false);

	const handleFocusIn = (event) => {
		if (!["textarea", "input"].includes(event.target.tagName.toLowerCase())) {
			return;
		}

		console.log("focusing", event.target);
		setIsInputElementFocused(true);
	};

	const handleFocusOut = (event) => {
		if (!["textarea", "input"].includes(event.target.tagName.toLowerCase())) {
			return;
		}

		console.log("focusout", event);
		setIsInputElementFocused(false);
	};

	useEffect(() => {
		document.addEventListener("focusin", handleFocusIn);
		document.addEventListener("focusout", handleFocusOut);

		return () => {
			document.removeEventListener("focusin", handleFocusIn);
			document.removeEventListener("focusout", handleFocusIn);
		};
	}, []);

	return {
		isInputElementFocused,
	};
};
