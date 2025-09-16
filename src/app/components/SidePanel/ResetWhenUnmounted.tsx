import React, { useCallback, useState, ReactElement } from "react";

export function ResetWhenUnmounted({ children }: { children: ReactElement }) {
	const [resetKey, setResetKey] = useState(0);

	const callbackRef = useCallback((element: Element | null) => {
		if (element === null) {
			setResetKey((previousKey) => previousKey + 1);
		}
	}, []);

	return (
		<div key={resetKey} ref={callbackRef} style={{ display: "contents" }}>
			{children}
		</div>
	);
}
