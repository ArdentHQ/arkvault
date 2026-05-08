import { useState, useRef, useLayoutEffect } from "react";

export const ResizeContainer = ({ children }) => {
	const containerRef = useRef(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0, lineHeight: 0 });

	useLayoutEffect(() => {
		if (!containerRef.current) return;

		const observer = new ResizeObserver((entries) => {
			for (let entry of entries) {
				const { width, height } = entry.contentRect;
				setDimensions({ width, height, lineHeight: parseFloat(getComputedStyle(entry.target).lineHeight) });
			}
		});

		observer.observe(containerRef.current);

		return () => observer.disconnect();
	}, []);

	return <div ref={containerRef}>{typeof children === "function" ? children(dimensions) : children}</div>;
};
