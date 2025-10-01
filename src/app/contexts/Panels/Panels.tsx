import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export enum Panel {
	CreateAddress = "CREATE_ADDRESS",
	ImportAddress = "IMPORT_ADDRESS",
	SendTransfer = "SEND_TRANSFER",
	SendVote = "SEND_VOTE",
	SignMessage = "SIGN_MESSAGE",
	SendUsernameResignation = "SEND_USERNAME_RESIGNATION",
	SendValidatorResignation = "SEND_VALIDATOR_RESIGNATION",
	SendValidatorRegistration = "SEND_VALIDATOR_REGISTRATION",
	SendUsernameRegistration = "SEND_USERNAME_REGISTRATION",
}

interface PanelsContextValue {
	currentOpenedPanel: Panel | undefined;
	closePanel: () => void;
	openPanel: (panel: Panel) => void;
	isMinimized: boolean;
	setIsMinimized: (isMinimized: boolean) => void;
	showConfirmationModal: boolean;
	setShowConfirmationModal: (showConfirmationModal: boolean) => void;
	confirmOpen: () => void;
	cancelOpen: () => void;
	toggleMinimize: () => void;
	currentOpenedPanelName: string | undefined;
}

const PanelsContext = React.createContext<PanelsContextValue | undefined>(undefined);

export const PanelsProvider = ({ children }: { children: React.ReactNode | React.ReactNode[] }) => {
	const { t } = useTranslation();
	const [currentOpenedPanel, setCurrentOpenedPanel] = useState<Panel | undefined>(undefined);
	const [panelToOpen, setPanelToOpen] = useState<Panel | undefined>(undefined);
	const [isMinimized, setIsMinimized] = useState(false);
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);

	const currentOpenedPanelName = useMemo(
		() => (currentOpenedPanel ? t(`COMMON.PANELS.${currentOpenedPanel}`) : undefined),
		[currentOpenedPanel, t],
	);

	const confirmOpen = () => {
		setShowConfirmationModal(false);

		setCurrentOpenedPanel(undefined);

		// Wait for the previous panel to be removed
		setTimeout(() => {
			setIsMinimized(false);

			setCurrentOpenedPanel(panelToOpen);
		}, 350);
	};

	const cancelOpen = () => {
		setShowConfirmationModal(false);

		setPanelToOpen(undefined);
	};

	useEffect(() => {
		if (!showConfirmationModal) {
			setPanelToOpen(undefined);
		}
	}, [showConfirmationModal]);

	const closePanel = () => {
		setCurrentOpenedPanel(undefined);

		if (isMinimized) {
			// Reset the minimized state after the transition is complete
			setTimeout(() => setIsMinimized(false), 350);
		}
	};

	const openPanel = (panel: Panel) => {
		// If the panel was minimized previously, ensure we clear minimized state
		// before opening so the entry transition comes from the right side.
		if (isMinimized) {
			if (currentOpenedPanel === panel) {
				setIsMinimized(false);
				return;
			} else {
				setShowConfirmationModal(true);
				setPanelToOpen(panel);
				return;
			}
		}

		setCurrentOpenedPanel(panel);
	};

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
				currentOpenedPanelName,
				isMinimized,
				openPanel,
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
