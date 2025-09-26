import { useDeeplinkActionHandler } from "@/app/hooks";
import React, { use, useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

export enum Panel {
	SendTransfer = "sendTransfer",
	SendVote = "sendVote",
	SignMessage = "signMessage",
	// ... etc
}

interface PanelsContextValue {
	currentOpenedPanel: Panel | undefined;
	closePanel: () => void;
	openPanel: (panel: Panel) => void;
	isMinimized: boolean;
	finishedMinimizing: boolean;
	minimizedHintHasShown: boolean;
	persistMinimizedHint: (minimizedHintHasShown: boolean) => void;
	setIsMinimized: (isMinimized: boolean) => void;
	showConfirmationModal: boolean;
	setShowConfirmationModal: (showConfirmationModal: boolean) => void;
	confirmOpen: () => void;
	cancelOpen: () => void;
	toggleMinimize: () => void;
}

const PanelsContext = React.createContext<PanelsContextValue | undefined>(undefined);

export const PanelsProvider = ({ children }: { children: React.ReactNode | React.ReactNode[] }) => {
	const [currentOpenedPanel, setCurrentOpenedPanel] = useState<Panel | undefined>(undefined);
	const [panelToOpen, setPanelToOpen] = useState<Panel | undefined>(undefined);
	const [isMinimized, setIsMinimized] = useState(false);
	const [finishedMinimizing, setFinishedMinimizing] = useState(false);
	const [minimizedHintHasShown, persistMinimizedHint] = useLocalStorage("minimized-hint", false);
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);

	const confirmOpen = () => {
		setShowConfirmationModal(false);

		setCurrentOpenedPanel(panelToOpen);

		setIsMinimized(false);
	};

	const cancelOpen = () => {
		setShowConfirmationModal(false);

		setPanelToOpen(undefined);
	};

	// useEffect(() => {
	// 	if (currentOpenedPanel === undefined && panelToOpen) {
	// 		setCurrentOpenedPanel(panelToOpen);
	// 	}
	// }, [currentOpenedPanel, panelToOpen]);

	useEffect(() => {
		if (!showConfirmationModal) {
			setPanelToOpen(undefined);
		}
	}, [showConfirmationModal]);

	useEffect(() => {
		if (isMinimized) {
			setTimeout(() => setFinishedMinimizing(true), 350);
		} else {
			setFinishedMinimizing(false);
		}
	}, [isMinimized]);

	const closePanel = () => {
		setCurrentOpenedPanel(undefined);

		if (isMinimized) {
			// Reset the minimized state after the transition is complete
			setTimeout(() => setIsMinimized(false), 350);
		}
	};

	const openPanel = (panel: Panel) => {
		if (isMinimized && currentOpenedPanel !== undefined) {
			if (currentOpenedPanel === panel) {
				setIsMinimized(false);
				return;
			}

			setShowConfirmationModal(true);

			setPanelToOpen(panel);

			return;
		}

		setCurrentOpenedPanel(panel);
	};

	useDeeplinkActionHandler({
		onSignMessage: () => {
			openPanel(Panel.SignMessage);
		},
		onTransfer: () => {
			openPanel(Panel.SendTransfer);
		},
	});

	const toggleMinimize = () => {
		setIsMinimized(!isMinimized);
	};

	return (
		<PanelsContext.Provider
			value={{
				cancelOpen,
				closePanel,
				confirmOpen,
				currentOpenedPanel,
				finishedMinimizing,
				isMinimized,
				minimizedHintHasShown,
				openPanel,
				persistMinimizedHint,
				setIsMinimized,
				setShowConfirmationModal,
				showConfirmationModal,
				toggleMinimize,
			}}
		>
			{children}
		</PanelsContext.Provider>
	);
};

export const usePanels = (): PanelsContextValue => {
	const context = React.useContext(PanelsContext);

	if (context === undefined) {
		throw new Error("[usePanels] Component not wrapped within a Provider");
	}

	return context;
};
