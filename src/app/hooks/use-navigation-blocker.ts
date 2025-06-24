import { useCallback, useEffect, useState } from "react";
import { BlockerFunction, useBlocker } from "react-router-dom";

export const useNavigationBlocker = ({ shouldBlock }: { shouldBlock: BlockerFunction }) => {
	const [isOpen, setIsOpen] = useState(false);

	const blocker = useBlocker(shouldBlock);

	// Handle blocker state changes
	useEffect(() => {
		if (blocker.state === "blocked") {
			setIsOpen(true);
		} else {
			setIsOpen(false);
		}
	}, [blocker.state]);

	const onCancel = useCallback(() => {
		if (blocker.state === "blocked") {
			blocker.reset();
		}

		setIsOpen(false);
	}, [blocker]);

	const onConfirm = useCallback(() => {
		if (blocker.state === "blocked") {
			blocker.proceed();
		}

		setIsOpen(false);
	}, [blocker]);

	return {
		isOpen,
		onCancel,
		onConfirm,
	};
};
