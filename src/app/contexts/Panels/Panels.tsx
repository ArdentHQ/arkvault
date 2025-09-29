import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "usehooks-ts";
import { ResetWhenUnmounted } from "@/app/components/SidePanel/ResetWhenUnmounted";
import SignMessageSidePanel from "@/domains/message/components/SignMessage";
import { SendTransferSidePanel } from "@/domains/transaction/components/SendTransferSidePanel/SendTransferSidePanel";
import { Modal } from "@/app/components/Modal";
import { Button } from "@/app/components/Button";
import { Image } from "@/app/components/Image";
import { Alert } from "@/app/components/Alert";
import { FormButtons } from "@/app/components/Form";
import { ImportAddressesSidePanel } from "@/domains/portfolio/components/ImportWallet";
import { CreateAddressesSidePanel } from "@/domains/portfolio/components/CreateWallet/CreateAddressSidePanel";
import { SendUsernameResignationSidePanel } from "@/domains/transaction/components/SendUsernameResignationSidePanel/SendUsernameResignationSidePanel";
import { SendValidatorResignationSidePanel } from "@/domains/transaction/components/SendValidatorResignationSidePanel/SendValidatorResignationSidePanel";
import { SendRegistrationSidePanel } from "@/domains/transaction/components/SendRegistrationSidePanel/SendRegistrationSidePanel";
import { useLocation } from "react-router";

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
	finishedMinimizing: boolean;
	minimizedHintHasShown: boolean;
	persistMinimizedHint: (minimizedHintHasShown: boolean) => void;
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
	const [finishedMinimizing, setFinishedMinimizing] = useState(false);
	const [minimizedHintHasShown, persistMinimizedHint] = useLocalStorage("minimized-hint", false);
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

const DiscardPanelConfirmationModal = () => {
	const { t } = useTranslation();
	const { showConfirmationModal, confirmOpen, cancelOpen, currentOpenedPanelName } = usePanels();

	return (
		<Modal
			title={t("COMMON.PENDING_ACTION_IN_PROGRESS")}
			image={<Image name="Warning" className="m-auto my-8 max-w-52" />}
			size="xl"
			isOpen={showConfirmationModal}
			onClose={cancelOpen}
		>
			<Alert>
				{t("COMMON.PENDING_ACTION_IN_PROGRESS_DESCRIPTION", {
					action: currentOpenedPanelName,
				})}
			</Alert>

			<FormButtons>
				<Button variant="secondary" onClick={cancelOpen} data-testid="ResetProfile__cancel-button">
					{t("COMMON.CANCEL")}
				</Button>

				<Button type="submit" onClick={confirmOpen} data-testid="ResetProfile__submit-button" variant="danger">
					<span>{t("COMMON.CONTINUE")}</span>
				</Button>
			</FormButtons>
		</Modal>
	);
};

export const AppPanels = () => {
	const { currentOpenedPanel, closePanel } = usePanels();

	const location = useLocation();

	if (
		!location.pathname.startsWith("/profiles") ||
		location.pathname.startsWith("/profiles/create") ||
		location.pathname.startsWith("/profiles/import")
	) {
		return;
	}

	return (
		<>
			<ResetWhenUnmounted>
				<SignMessageSidePanel open={currentOpenedPanel === Panel.SignMessage} onOpenChange={closePanel} />
			</ResetWhenUnmounted>

			<ResetWhenUnmounted>
				<SendTransferSidePanel open={currentOpenedPanel === Panel.SendTransfer} onOpenChange={closePanel} />
			</ResetWhenUnmounted>

			<ResetWhenUnmounted>
				<CreateAddressesSidePanel open={currentOpenedPanel === Panel.CreateAddress} onOpenChange={closePanel} />
			</ResetWhenUnmounted>

			<ResetWhenUnmounted>
				<ImportAddressesSidePanel open={currentOpenedPanel === Panel.ImportAddress} onOpenChange={closePanel} />
			</ResetWhenUnmounted>

			<ResetWhenUnmounted>
				<SendUsernameResignationSidePanel
					open={currentOpenedPanel === Panel.SendUsernameResignation}
					onOpenChange={closePanel}
				/>
			</ResetWhenUnmounted>

			<ResetWhenUnmounted>
				<SendValidatorResignationSidePanel
					open={currentOpenedPanel === Panel.SendValidatorResignation}
					onOpenChange={closePanel}
				/>
			</ResetWhenUnmounted>

			<ResetWhenUnmounted>
				<SendRegistrationSidePanel
					open={
						currentOpenedPanel === Panel.SendValidatorRegistration ||
						currentOpenedPanel === Panel.SendUsernameRegistration
					}
					registrationType={
						currentOpenedPanel === Panel.SendValidatorRegistration
							? "validatorRegistration"
							: "usernameRegistration"
					}
					onOpenChange={(open) => {
						if (!open) {
							closePanel();
							return;
						}
					}}
				/>
			</ResetWhenUnmounted>

			<DiscardPanelConfirmationModal />
		</>
	);
};
