import { useCallback, useEffect, useMemo, useState } from "react";
import { browser } from "@/utils/platform";

const useModalOverflowYOffset = ({
	modalContainerReference,
}: {
	modalContainerReference: { current: HTMLDivElement | null };
}) => {
	const [overflowYClass, setOffsetYClass] = useState("overflow-y-hidden");

	useEffect(() => {
		const updateModalOffset = () => {
			const windowHeight = window.innerHeight;
			const modalHeight = modalContainerReference?.current?.clientHeight || 0;

			if (windowHeight - modalHeight < 85) {
				setOffsetYClass("overflow-y-auto");
			} else {
				setOffsetYClass("overflow-y-hidden");
			}
		};

		window.addEventListener("resize", updateModalOffset);
		updateModalOffset();

		return () => window.removeEventListener("resize", updateModalOffset);
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
