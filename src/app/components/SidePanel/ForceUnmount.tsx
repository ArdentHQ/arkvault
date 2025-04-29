import React, { cloneElement, Fragment, ReactElement, useEffect, useState } from "react";

export const ForceUnmount = ({ children }: {children: ReactElement}) => {
	const [mounted, setMounted] = useState(true);
	const [key, setKey] = useState(0);

	useEffect(() => {
		if (!mounted) {
			setKey((key) => key + 1);
		}

	}, [mounted])

	console.log(mounted, key);
	return <Fragment key={key}>{cloneElement(children, {onMountChange: setMounted})}</Fragment>
}
