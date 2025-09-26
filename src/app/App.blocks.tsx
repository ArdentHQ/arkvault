import React, { useLayoutEffect, useRef } from "react";
import { createHashRouter, RouterProvider, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useErrorBoundary } from "react-error-boundary";
import { ToastContainer } from "react-toastify";

import { useConfiguration, useEnvironmentContext, useNavigationContext } from "@/app/contexts";
import { useNetworkStatus, useProfileSynchronizer, useTheme } from "@/app/hooks";
import { toasts } from "@/app/services";
import { SyncErrorMessage } from "@/app/components/ProfileSyncStatusMessage";
import { bootEnvironmentWithProfileFixtures, isE2E, isUnit } from "@/utils/test-helpers";
import { Offline } from "@/domains/error/pages";
import { middlewares, RouterView, routes } from "@/router";
import { PageSkeleton } from "@/app/components/PageSkeleton";
import { ProfilePageSkeleton } from "@/app/components/PageSkeleton/ProfilePageSkeleton";
import { InstallPWA } from "@/domains/dashboard/components/InstallPWA";
import { useProfileBackgroundJobsRunner } from "./hooks/use-profile-background-jobs";
import { ResetWhenUnmounted } from "./components/SidePanel/ResetWhenUnmounted";
import SignMessageSidePanel from "@/domains/message/components/SignMessage";
import { Panel, usePanels } from "./contexts/Panels";
import { SendTransferSidePanel } from "@/domains/transaction/components/SendTransferSidePanel/SendTransferSidePanel";
import { Modal } from "./components/Modal";
import { Button } from "./components/Button";
import { Image } from "./components/Image";
import { Alert } from "./components/Alert";
import { FormButtons } from "./components/Form";
import { ImportAddressesSidePanel } from "@/domains/portfolio/components/ImportWallet";
import { CreateAddressesSidePanel } from "@/domains/portfolio/components/CreateWallet/CreateAddressSidePanel";
import { SendUsernameResignationSidePanel } from "@/domains/transaction/components/SendUsernameResignationSidePanel/SendUsernameResignationSidePanel";
import { SendValidatorResignationSidePanel } from "@/domains/transaction/components/SendValidatorResignationSidePanel/SendValidatorResignationSidePanel";
import { SendRegistrationSidePanel } from "@/domains/transaction/components/SendRegistrationSidePanel/SendRegistrationSidePanel";

const Main = () => {
	const { env, persist, isEnvironmentBooted, setIsEnvironmentBooted } = useEnvironmentContext();
	const isOnline = useNetworkStatus();
	const navigate = useNavigate();
	const location = useLocation();
	const syncingMessageToastId = useRef<number | string>(undefined);

	const { resetTheme } = useTheme();

	const { setShowMobileNavigation } = useNavigationContext();

	const { t } = useTranslation();

	const { profile } = useProfileSynchronizer({
		onLedgerCompatibilityError: () => {
			toasts.warning(t("COMMON.LEDGER_COMPATIBILITY_ERROR_LONG"), { autoClose: false });
		},
		onProfileRestoreError: () => {
			navigate("/", {
				state: {
					from: location.pathname + location.search,
				},
			});
		},
		onProfileSignOut: () => {
			resetTheme();
			toasts.dismiss();

			setShowMobileNavigation(false);
		},
		onProfileSyncComplete: async () => {
			await toasts.dismiss(syncingMessageToastId.current);
			toasts.success(t("COMMON.PROFILE_SYNC_COMPLETED"));
		},
		onProfileSyncError: async (failedNetworkNames, retryProfileSync) => {
			await toasts.dismiss(syncingMessageToastId.current);
			toasts.warning(<SyncErrorMessage failedNetworkNames={failedNetworkNames} onRetry={retryProfileSync} />);
		},
		onProfileSyncStart: () => {
			syncingMessageToastId.current = toasts.warning(t("COMMON.PROFILE_SYNC_STARTED"), { autoClose: false });
		},
		onProfileUpdated: () => {
			navigate("/");
		},
	});

	useProfileBackgroundJobsRunner(profile);

	const { profileHasSyncedOnce } = useConfiguration().getProfileConfiguration(profile?.id());

	const { showBoundary } = useErrorBoundary();

	useLayoutEffect(() => {
		const boot = async () => {
			try {
				/* istanbul ignore next -- @preserve */
				if (isE2E() || isUnit()) {
					await bootEnvironmentWithProfileFixtures({ env, shouldRestoreDefaultProfile: isUnit() });
					await persist();

					setIsEnvironmentBooted(true);
					return;
				}

				/* istanbul ignore next -- @preserve */
				await env.verify();

				/* istanbul ignore next -- @preserve */
				await env.boot();

				setIsEnvironmentBooted(true);
			} catch (error) {
				showBoundary(error);
			}
		};

		boot();
	}, [env, showBoundary]);

	const Skeleton = location.pathname.startsWith("/profiles") ? ProfilePageSkeleton : PageSkeleton;

	const renderContent = () => {
		if (!isOnline) {
			return <Offline />;
		}

		/* istanbul ignore else -- @preserve */
		if (isEnvironmentBooted && (!profile || profileHasSyncedOnce)) {
			return <RouterView routes={routes} middlewares={middlewares} />;
		}

		return <Skeleton />;
	};

	return (
		<main data-testid="Main">
			<InstallPWA />

			<ToastContainer closeOnClick={false} newestOnTop />

			{renderContent()}
		</main>
	);
};

const router = createHashRouter([
	{
		element: <Main />,
		path: "/*",
	},
]);

const AppRouter = () => (
	<React.Suspense fallback={<PageSkeleton />}>
		<RouterProvider router={router} />
	</React.Suspense>
);

export const DiscardPanelConfirmationModal = () => {
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

const AppPanels = () => {
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

export { AppRouter, Main, AppPanels };
