import { useCallback, useEffect, useMemo, useState } from "react";
import { browser } from "@/utils/platform";

export const observeElementHeight = (modalElement: HTMLDivElement, onResize: () => undefined) => {
	const observer = new ResizeObserver(() => onResize());

	observer.observe(modalElement);
	return observer;
};

const useModalOverflowYOffset = ({
	modalContainerReference,
}: {
	modalContainerReference: { current: HTMLDivElement | null };
}) => {
	const [overflowYClass, setOffsetYClass] = useState("overflow-y-hidden");

	useEffect(() => {
		const updateModalOffset = () => {
			const windowHeight = window.innerHeight;
			const currentModalHeight = modalContainerReference?.current?.clientHeight || 0;

			if (windowHeight - currentModalHeight < 85) {
				setOffsetYClass("overflow-y-auto");
			} else {
				setOffsetYClass("overflow-y-hidden");
			}

			return undefined;
		};

		let observer: ResizeObserver;
		if (!!modalContainerReference?.current) {
			observer = observeElementHeight(modalContainerReference.current, updateModalOffset);
		}

		window.addEventListener("resize", updateModalOffset);
		updateModalOffset();

		return () => {
			window.removeEventListener("resize", updateModalOffset);
			observer?.disconnect();
		};
	}, [modalContainerReference.current]);

	return {
		overflowYClass,
	};
};

export const useModal = ({
	isOpen,
	onClose,
	modalContainerReference,
}: {
	isOpen: boolean;
	onClose?: any;
	modalContainerReference: { current: HTMLDivElement | null };
}) => {
	const defaultOverflow = useMemo(() => (browser.supportsOverflowOverlay() ? "overlay" : "scroll"), []);
	const { overflowYClass } = useModalOverflowYOffset({ modalContainerReference });

	useEffect(() => {
		document.body.style.overflowY = defaultOverflow;

		if (isOpen) {
			document.body.style.overflowY = "hidden";
		}

		return () => {
			document.body.style.overflowY = defaultOverflow;
		};
	}, [defaultOverflow, isOpen]);

	const onEscKey = useCallback(
		(event: KeyboardEvent) => {
			event.preventDefault();
			event.stopPropagation();
			if (event.key === "Escape") {
				onClose();
			}
		},
		[onClose],
	);

	useEffect(() => {
		if (isOpen) {
			document.addEventListener("keyup", onEscKey, false);
		} else {
			document.removeEventListener("keyup", onEscKey);
		}

		return () => {
			document.removeEventListener("keyup", onEscKey);
		};
	}, [isOpen, onEscKey]);

	return {
		overflowYClass,
	};
};
