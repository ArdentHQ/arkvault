import { Global, css } from "@emotion/react";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { HashRouter, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useErrorBoundary } from "react-error-boundary";
import { ToastContainer } from "react-toastify";

import { ConfirmationModal } from "@/app/components/ConfirmationModal";
import { useEnvironmentContext, useNavigationContext } from "@/app/contexts";
import { useAccentColor, useNetworkStatus, useProfileSynchronizer, useTheme } from "@/app/hooks";
import { toasts } from "@/app/services";
import { SyncErrorMessage } from "@/app/components/ProfileSyncStatusMessage";
import { bootEnvironmentWithProfileFixtures, isE2E, isUnit } from "@/utils/test-helpers";
import { Offline } from "@/domains/error/pages";
import { middlewares, RouterView, routes } from "@/router";
import { PageSkeleton } from "@/app/components/PageSkeleton";
import { ProfilePageSkeleton } from "@/app/components/PageSkeleton/ProfilePageSkeleton";
import { InstallPWA } from "@/domains/dashboard/components/InstallPWA";

const AppRouter = ({ children }: { children: React.ReactNode }) => {
	const [isOpen, setIsOpen] = useState(false);

	const confirmationFunctionReference = useRef<(allowNavigate: boolean) => void>();

	const onCancel = () => {
		confirmationFunctionReference.current?.(false);
		setIsOpen(false);
	};

	const onConfirm = () => {
		confirmationFunctionReference.current?.(true);
		setIsOpen(false);
	};

	const getUserConfirmation = useCallback((_, callback) => {
		confirmationFunctionReference.current = callback;
		setIsOpen(true);
	}, []);

	return (
		<React.Suspense fallback={<PageSkeleton />}>
			<HashRouter getUserConfirmation={getUserConfirmation}>
				{children}
				<ConfirmationModal isOpen={isOpen} onCancel={onCancel} onConfirm={onConfirm} />
			</HashRouter>
		</React.Suspense>
	);
};

const customStyles = css`
	h1 {
		margin-bottom: 0.5rem;
		font-size: 2.25rem;
		line-height: 2.5rem;
		font-weight: 700;
	}
	h2 {
		margin-bottom: 0.5rem;
		font-size: 1.875rem;
		line-height: 2.25rem;
		font-weight: 700;
	}
	h3 {
		margin-bottom: 0.5rem;
		font-size: 1.5rem;
		line-height: 2rem;
		font-weight: 600;
	}
`;

const GlobalStyles: React.VFC = () => (
	<>
		<Global styles={customStyles} />
	</>
);

const Main: React.VFC = () => {
	const { env, persist, isEnvironmentBooted, setIsEnvironmentBooted } = useEnvironmentContext();
	const isOnline = useNetworkStatus();
	const history = useHistory();
	const syncingMessageToastId = useRef<number | string>();

	const { resetAccentColor } = useAccentColor();
	const { resetTheme } = useTheme();

	const { setShowMobileNavigation } = useNavigationContext();

	const { t } = useTranslation();

	useProfileSynchronizer({
		onLedgerCompatibilityError: () => {
			toasts.warning(t("COMMON.LEDGER_COMPATIBILITY_ERROR_LONG"), { autoClose: false });
		},
		onProfileRestoreError: () =>
			history.push({
				pathname: "/",
				state: {
					from: history.location.pathname + history.location.search,
				},
			}),
		onProfileSignOut: () => {
			resetTheme();
			resetAccentColor();
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
			history.replace("/");
		},
	});

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

	const Skeleton = history.location.pathname.startsWith("/profiles") ? ProfilePageSkeleton : PageSkeleton;

	const renderContent = () => {
		if (!isOnline) {
			return <Offline />;
		}

		/* istanbul ignore else -- @preserve */
		if (isEnvironmentBooted) {
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

export { AppRouter, GlobalStyles, Main };
