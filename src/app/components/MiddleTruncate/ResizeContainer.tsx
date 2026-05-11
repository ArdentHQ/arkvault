import { useState, useRef, useLayoutEffect } from "react";

export const ResizeContainer = ({ children }) => {
	const containerRef = useRef(null);
	const [dimensions, setDimensions] = useState({ height: 0, lineHeight: 0, width: 0 });

	useLayoutEffect(() => {
		if (!containerRef.current) {
			return;
		}

		const observer = new ResizeObserver((entries) => {
			for (let entry of entries) {
				const { width, height } = entry.contentRect;
				setDimensions({
					height,
					lineHeight: Number.parseFloat(getComputedStyle(entry.target).lineHeight),
					width,
				});
			}
		});

		observer.observe(containerRef.current);

		return () => observer.disconnect();
	}, []);

	return <div ref={containerRef}>{typeof children === "function" ? children(dimensions) : children}</div>;
};
