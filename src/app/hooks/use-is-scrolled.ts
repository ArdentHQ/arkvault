import { useEffect, useState } from "react";

export const useIsScrolled = <T extends HTMLElement>({
	scrollContainerRef,
	active,
}: {
	scrollContainerRef: React.RefObject<T | null>;
	active: boolean;
}) => {
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		if (!active) {
			return;
		}

		const checkIsScrolled = () => {
			const el = scrollContainerRef.current;
			if (el) {
				setIsScrolled(el.scrollHeight > el.clientHeight);
			}
		};

		checkIsScrolled();

		const resizeObserver = new ResizeObserver(() => checkIsScrolled());
		if (scrollContainerRef.current) {
			resizeObserver.observe(scrollContainerRef.current);
		}

		return () => resizeObserver.disconnect();
	}, [active]);

	return isScrolled;
};
