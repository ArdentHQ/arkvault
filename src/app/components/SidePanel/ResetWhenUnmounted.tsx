import React, { useState, ReactElement, useEffect, cloneElement, Fragment } from "react";

export function ResetWhenUnmounted({ children }: { children: ReactElement }) {
	const [mounted, setMounted] = useState(true);
	const [key, setKey] = useState(0);

	useEffect(() => {
		if (!mounted) {
			setKey((key) => key + 1);
		}
	}, [mounted]);

	return <Fragment key={key}>{cloneElement(children, { onMountChange: setMounted })}</Fragment>;
}
