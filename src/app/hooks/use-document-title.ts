import { useRef, useEffect } from "react";

const BASE_TITLE = "ARK Vault";

const setTitle = (title: string) => {
	document.title = title;
};

const formatTitle = (title?: string) => {
	if (title) {
		return `${title} | ${BASE_TITLE}`;
	}

	return BASE_TITLE;
};

export const useDocumentTitle = (title?: string, resetOnUnmount = true) => {
	const originalTitle = useRef(document.title);

	useEffect(() => setTitle(formatTitle(title)), [formatTitle, setTitle, title]);

	useEffect(
		() => () => {
			if (resetOnUnmount) {
				setTitle(originalTitle.current);
			}
		},
		[],
	);
};
