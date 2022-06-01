import { useEffect } from "react";

export const useKeydown = (key: string, handler: (event: KeyboardEvent) => void | Promise<void>): void => {
	useEffect(() => {
		const onKeydown = (event: KeyboardEvent) => {
			if (event.key === key) {
				void handler(event);
			}
		};

		document.addEventListener("keydown", onKeydown);

		return () => {
			document.removeEventListener("keydown", onKeydown);
		};
	});
};
