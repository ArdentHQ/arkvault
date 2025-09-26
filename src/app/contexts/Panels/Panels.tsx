import { useDeeplinkActionHandler } from "@/app/hooks";
import React, { useEffect, useState } from "react";
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
}

const PanelsContext = React.createContext<PanelsContextValue | undefined>(undefined);

export const PanelsProvider = ({ children }: { children: React.ReactNode | React.ReactNode[] }) => {
	const [currentOpenedPanel, setCurrentOpenedPanel] = useState<Panel | undefined>(undefined);
	const [isMinimized, setIsMinimized] = useState(false);
	const [finishedMinimizing, setFinishedMinimizing] = useState(false);
	const [minimizedHintHasShown, persistMinimizedHint] = useLocalStorage("minimized-hint", false);

	useEffect(() => {
		if (isMinimized) {
			setTimeout(() => setFinishedMinimizing(true), 350);
		} else {
			setFinishedMinimizing(false);
		}
	}, [isMinimized]);

	const closePanel = () => {
		setCurrentOpenedPanel(undefined);
	};

	const openPanel = (panel: Panel) => {
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

	return (
		<PanelsContext.Provider
			value={{
				closePanel,
				currentOpenedPanel,
				finishedMinimizing,
				isMinimized,
				minimizedHintHasShown,
				openPanel,
				persistMinimizedHint,
				setIsMinimized,
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
