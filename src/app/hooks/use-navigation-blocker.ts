import { useCallback, useEffect } from "react"
import { useBlocker } from "react-router-dom"

interface UseNavigationBlockerOptions {
	when?: boolean | (() => boolean)
}

export const useNavigationBlocker = () => {
	const [isOpen, setIsOpen] = useState(false);

	const shouldBlock = () => {
		return false; // Default to not blocking
	};

	const blocker = useBlocker(
		({ currentLocation, nextLocation }) => shouldBlock() && currentLocation.pathname !== nextLocation.pathname
	);

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
	}
}
