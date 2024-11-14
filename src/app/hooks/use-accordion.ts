import { useCallback, useState } from "react";

export const useAccordion = () => {
	const [isExpanded, setIsExpanded] = useState(true);

	const handleHeaderClick = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			event.preventDefault();

			setIsExpanded(!isExpanded);
		},
		[isExpanded],
	);

	return { handleHeaderClick, isExpanded };
};
