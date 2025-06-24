import { ConfirmationModal } from "@/app/components/ConfirmationModal";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useBlocker } from "react-router";

interface NavigationBlockingContextType {
	shouldBlock: boolean;
	setShouldBlock: (block: boolean) => void;
	blockingMessage?: string;
	setBlockingMessage: (message?: string) => void;
}

const NavigationBlockingContext = createContext<NavigationBlockingContextType | null>(null);

export const useNavigationBlocking = () => {
	const context = useContext(NavigationBlockingContext);
	if (!context) {
		throw new Error("useNavigationBlocking must be used within NavigationBlockingProvider");
	}
	return context;
};

export const NavigationBlockingProvider = ({ children }: { children: React.ReactNode }) => {
	const [shouldBlock, setShouldBlock] = useState(false);
	const [blockingMessage, setBlockingMessage] = useState<string>();

	return (
		<NavigationBlockingContext.Provider
			value={{ blockingMessage, setBlockingMessage, setShouldBlock, shouldBlock }}
		>
			{children}
		</NavigationBlockingContext.Provider>
	);
};

export const NavigationBlocker = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { shouldBlock: shouldBlockFromContext, blockingMessage } = useNavigationBlocking();

	const blocker = useBlocker(
		({ currentLocation, nextLocation }) =>
			shouldBlockFromContext && currentLocation.pathname !== nextLocation.pathname,
	);

	useEffect(() => {
		if (blocker.state === "blocked") {
			setIsOpen(true);
			return;
		}

		setIsOpen(false);
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

	return (
		<ConfirmationModal isOpen={isOpen} onCancel={onCancel} onConfirm={onConfirm} description={blockingMessage} />
	);
};
