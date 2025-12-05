import { Panel, SIDE_PANEL_TRANSITION_DURATION, usePanels } from "./contexts";

import { AddressesSidePanel } from "@/domains/portfolio/components/AddressesSidePanel";
import { Alert } from "@/app/components/Alert";
import { Button } from "@/app/components/Button";
import { CreateAddressesSidePanel } from "@/domains/portfolio/components/CreateWallet/CreateAddressSidePanel";
import { FormButtons } from "@/app/components/Form";
import { Image } from "@/app/components/Image";
import { ImportAddressesSidePanel } from "@/domains/portfolio/components/ImportWallet";
import { LedgerMigrationSidepanel } from "@/domains/portfolio/components/LedgerMigration";
import { Modal } from "@/app/components/Modal";
import { NotificationsSidepanel } from "@/domains/portfolio/components/NotificationsSidepanel/NotificationsSidepanel";
import React from "react";
import { ResetWhenUnmounted } from "@/app/components/SidePanel/ResetWhenUnmounted";
import { SendRegistrationSidePanel } from "@/domains/transaction/components/SendRegistrationSidePanel/SendRegistrationSidePanel";
import { SendTransferSidePanel } from "@/domains/transaction/components/SendTransferSidePanel/SendTransferSidePanel";
import { SendUsernameResignationSidePanel } from "@/domains/transaction/components/SendUsernameResignationSidePanel/SendUsernameResignationSidePanel";
import { SendValidatorResignationSidePanel } from "@/domains/transaction/components/SendValidatorResignationSidePanel/SendValidatorResignationSidePanel";
import SignMessageSidePanel from "@/domains/message/components/SignMessage";
import VerifyMessageSidePanel from "@/domains/message/components/VerifyMessage";
import { useHasProfile } from "./hooks";
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

			<div className="modal-footer">
				<FormButtons>
					<Button variant="secondary" onClick={cancelOpen} data-testid="ResetProfile__cancel-button">
						{t("COMMON.CANCEL")}
					</Button>

					<Button
						type="submit"
						onClick={confirmOpen}
						data-testid="ResetProfile__submit-button"
						variant="danger"
					>
						<span>{t("COMMON.CONTINUE")}</span>
					</Button>
				</FormButtons>
			</div>
		</Modal>
	);
};

export const AppPanels = () => {
	const { currentOpenedPanel, closePanel, openPanel } = usePanels();

	const hasProfile = useHasProfile();

	if (!hasProfile) {
		return;
	}

	return (
		<>
			<ResetWhenUnmounted>
				<SignMessageSidePanel open={currentOpenedPanel === Panel.SignMessage} onOpenChange={closePanel} />
			</ResetWhenUnmounted>

			<ResetWhenUnmounted>
				<VerifyMessageSidePanel open={currentOpenedPanel === Panel.VerifyMessage} onOpenChange={closePanel} />
			</ResetWhenUnmounted>

			<ResetWhenUnmounted>
				<SendTransferSidePanel open={currentOpenedPanel === Panel.SendTransfer} onOpenChange={closePanel} />
			</ResetWhenUnmounted>

			<ResetWhenUnmounted>
				<CreateAddressesSidePanel
					open={currentOpenedPanel === Panel.CreateAddress}
					onOpenChange={closePanel}
					onImportAddress={async () => {
						await closePanel();

						setTimeout(() => {
							openPanel(Panel.ImportAddress);
						}, SIDE_PANEL_TRANSITION_DURATION);
					}}
				/>
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
					open={currentOpenedPanel === Panel.SendUsernameRegistration}
					registrationType="usernameRegistration"
					onOpenChange={closePanel}
				/>
			</ResetWhenUnmounted>

			<ResetWhenUnmounted>
				<SendRegistrationSidePanel
					open={currentOpenedPanel === Panel.SendValidatorRegistration}
					registrationType="validatorRegistration"
					onOpenChange={closePanel}
				/>
			</ResetWhenUnmounted>

			<ResetWhenUnmounted>
				<SendRegistrationSidePanel
					open={currentOpenedPanel === Panel.SendContractDeployment}
					registrationType="contractDeployment"
					onOpenChange={closePanel}
				/>
			</ResetWhenUnmounted>

			<ResetWhenUnmounted>
				<AddressesSidePanel open={currentOpenedPanel === Panel.Addresses} onOpenChange={closePanel} />
			</ResetWhenUnmounted>

			<ResetWhenUnmounted>
				<NotificationsSidepanel open={currentOpenedPanel === Panel.Notifications} onOpenChange={closePanel} />
			</ResetWhenUnmounted>

			<LedgerMigrationSidepanel open={currentOpenedPanel === Panel.LedgerMigration} onOpenChange={closePanel} />

			<DiscardPanelConfirmationModal />
		</>
	);
};
