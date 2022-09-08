import { useEffect, useState } from "react";

export const useInputFocus = () => {
	const [isInputElementFocused, setIsInputElementFocused] = useState(false);

	const handleFocusIn = (event) => {
		console.log(event.target.type.toLowerCase());
		if (!["textarea", "text", "password"].includes(event.target.type.toLowerCase())) {
			return;
		}

		console.log(event.target.type);
		console.log("focusing", event.target);
		setIsInputElementFocused(true);
	};

	const handleFocusOut = (event) => {
		if (!["textarea", "text", "password"].includes(event.target.type.toLowerCase())) {
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
