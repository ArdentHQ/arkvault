import { useEffect } from "react";

export const useKeyup = (key: string, handler: (event: KeyboardEvent) => void | Promise<void>): void => {
	useEffect(() => {
		const onKeyup = (event: KeyboardEvent) => {
			if (event.key === key) {
				void handler(event);
			}
		};

		document.addEventListener("keyup", onKeyup);

		return () => {
			document.removeEventListener("keyup", onKeyup);
		};
	});
};
