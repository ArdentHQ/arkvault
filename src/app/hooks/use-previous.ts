import { useEffect, useRef } from "react";

export const usePrevious = <T>(value: T) => {
	const reference = useRef<T>();

	useEffect(() => {
		reference.current = value;
	}, [value]);

	return reference.current;
};
