import { useDeeplinkActionHandler } from "@/app/hooks";
import React, { useState } from "react";

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
}

const PanelsContext = React.createContext<PanelsContextValue | undefined>(undefined);

export const PanelsProvider = ({ children }: { children: React.ReactNode | React.ReactNode[] }) => {
	const [currentOpenedPanel, setCurrentOpenedPanel] = useState<Panel | undefined>(undefined);

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
				openPanel,
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
