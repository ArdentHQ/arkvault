import React from "react";
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
import { Panel, usePanels } from "./contexts";
import { useTranslation } from "react-i18next";

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
