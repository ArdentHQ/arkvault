import React, { useEffect, useRef } from "react";

import { ContentInsideCircleProperties } from "./DonutGraph.contracts";

export const ContentInsideCircle: React.VFC<ContentInsideCircleProperties> = ({ renderFunction, size }) => {
	const reference = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const container = reference.current;

		if (!container) {
			return;
		}

		const { width, height } = container.getBoundingClientRect();

		// Center content vertically and horizontally.
		container.style.left = `${Math.floor(size / 2 - width / 2)}px`;
		container.style.top = `${Math.floor(size / 2 - height / 2)}px`;
	}, [size]);

	if (!renderFunction) {
		return <></>;
	}

	return (
		<div className="absolute" ref={reference}>
			{renderFunction()}
		</div>
	);
};
