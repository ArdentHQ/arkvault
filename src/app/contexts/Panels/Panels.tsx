import React, { useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";

export enum Panel {
	CreateAddress = "CREATE_ADDRESS",
	ImportAddress = "IMPORT_ADDRESS",
	SendTransfer = "SEND_TRANSFER",
	SendTokenTransfer = "SEND_TOKEN_TRANSFER",
	SendVote = "SEND_VOTE",
	SignMessage = "SIGN_MESSAGE",
	VerifyMessage = "VERIFY_MESSAGE",
	SendUsernameResignation = "SEND_USERNAME_RESIGNATION",
	SendValidatorResignation = "SEND_VALIDATOR_RESIGNATION",
	SendValidatorRegistration = "SEND_VALIDATOR_REGISTRATION",
	SendUsernameRegistration = "SEND_USERNAME_REGISTRATION",
	SendContractDeployment = "SEND_CONTRACT_DEPLOYMENT",
	Addresses = "ADDRESSES",
	LedgerMigration = "LEDGER_MIGRATION",
	TransactionDetails = "TRANSACTION_DETAILS",
	Notifications = "NOTIFICATIONS",
}

interface PanelWithProperties {
	name: Panel;
	properties?: Record<string, unknown>;
}

interface PanelsContextValue {
	currentOpenedPanel?: PanelWithProperties;
	closePanel: () => Promise<void>;
	openPanel: (panel: Panel, properties?: Record<string, unknown>) => void;
	isMinimized: boolean;
	isExpanded: boolean;
	setIsMinimized: (isMinimized: boolean) => void;
	showConfirmationModal: boolean;
	setShowConfirmationModal: (showConfirmationModal: boolean) => void;
	confirmOpen: () => Promise<void>;
	cancelOpen: () => void;
	toggleMinimize: () => void;
	toggleExpand: () => void;
	currentOpenedPanelName: string | undefined;
}

const PanelsContext = React.createContext<PanelsContextValue | undefined>(undefined);

export const SIDE_PANEL_TRANSITION_DURATION = 350;

export const PanelsProvider = ({ children }: { children: React.ReactNode | React.ReactNode[] }) => {
	const { t } = useTranslation();
	const [currentOpenedPanel, setCurrentOpenedPanel] = useState<PanelWithProperties | undefined>(undefined);
	const [panelToOpen, setPanelToOpen] = useState<PanelWithProperties | undefined>(undefined);
	const [isMinimized, setIsMinimized] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);
	const [componentResetedPromiseResolver, setComponentResetedPromiseResolver] = useState<
		((value: void | PromiseLike<void>) => void) | undefined
	>(undefined);

	const currentOpenedPanelName = useMemo(
		() => (currentOpenedPanel ? t(`COMMON.PANELS.${currentOpenedPanel}`) : undefined),
		[currentOpenedPanel, t],
	);

	const confirmOpen = async () => {
		setShowConfirmationModal(false);

		await closePanel();

		setIsMinimized(false);

		setCurrentOpenedPanel(panelToOpen);
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

	const closePanel = (): Promise<void> =>
		new Promise((resolve) => {
			setCurrentOpenedPanel(undefined);

			if (isMinimized) {
				// Reset the minimized state after the transition is complete
				setTimeout(() => {
					setIsMinimized(false);

					setComponentResetedPromiseResolver(resolve);
				}, SIDE_PANEL_TRANSITION_DURATION);
			} else {
				setComponentResetedPromiseResolver(resolve);
			}
		});

	// We need to wait for the component to be fully reset before considering the panel closed.
	// The resetKey destroys the old component and creates a new one, but if we try to open
	// another panel immediately, the old component may not have been completely destroyed yet.
	useEffect(() => {
		if (componentResetedPromiseResolver) {
			componentResetedPromiseResolver();
			setComponentResetedPromiseResolver(undefined);
		}
	}, [componentResetedPromiseResolver]);

	const openPanel = (panel: Panel, properties?: Record<string, unknown>) => {
		if (isMinimized) {
			setShowConfirmationModal(true);
			setPanelToOpen({ name: panel, properties });
			return;
		}

		setIsMinimized(false);
		setCurrentOpenedPanel({ name: panel, properties });
	};

	const toggleMinimize = () => {
		if (!isMinimized) {
			setIsExpanded(false);
		}
		setIsMinimized(!isMinimized);
	};

	const toggleExpand = () => {
		setIsExpanded(!isExpanded);
	};

	return (
		<PanelsContext.Provider
			value={{
				cancelOpen,
				closePanel,
				confirmOpen,
				currentOpenedPanel,
				currentOpenedPanelName,
				isExpanded,
				isMinimized,
				openPanel,
				setIsMinimized,
				setShowConfirmationModal,
				showConfirmationModal,
				toggleExpand,
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
