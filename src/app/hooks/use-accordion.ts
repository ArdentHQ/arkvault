import { useCallback, useEffect, useState } from "react";

const getStorageKey = (key: string) => `accordion_${key}_isExpanded`;

export const useAccordion = (key: string) => {
	const storageKey = getStorageKey(key);
	const [isExpanded, setIsExpanded] = useState<boolean>(() => {
		const storedValue = localStorage.getItem(storageKey);
		return storedValue ? JSON.parse(storedValue) : true;
	});

	const handleHeaderClick = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			event.preventDefault();

			const newValue = !isExpanded;
			setIsExpanded(newValue);
			localStorage.setItem(storageKey, JSON.stringify(newValue));
		},
		[isExpanded, storageKey],
	);

	useEffect(() => {
		const handleStorageChange = () => {
			const storedValue = localStorage.getItem(storageKey);
			if (storedValue) {
				setIsExpanded(JSON.parse(storedValue));
			}
		};

		window.addEventListener("storage", handleStorageChange);
		return () => window.removeEventListener("storage", handleStorageChange);
	}, [storageKey]);

	return { handleHeaderClick, isExpanded };
};
