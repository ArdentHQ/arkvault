import { Global, css } from "@emotion/react";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { HashRouter, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useErrorHandler } from "react-error-boundary";
import { ToastContainer } from "react-toastify";
import { GlobalStyles as BaseStyles } from "twin.macro";

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

const AppRouter: React.FC = ({ children }) => {
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
		<BaseStyles />
		<Global styles={customStyles} />
	</>
);

const Main: React.VFC = () => {
	const { env, persist, isEnvironmentBooted, setIsEnvironmentBooted } = useEnvironmentContext();
	const isOnline = useNetworkStatus();
	const history = useHistory();

	const { resetAccentColor } = useAccentColor();
	const { resetTheme } = useTheme();

	const { setShowMobileNavigation } = useNavigationContext();

	const { t } = useTranslation();

	useProfileSynchronizer({
		onProfileRestoreError: () =>
			history.push({
				pathname: "/",
				state: {
					from:
						history.location.pathname + history.location.search ??
						/* istanbul ignore next -- @preserve */ "",
				},
			}),
		onProfileSignOut: () => {
			resetTheme();
			resetAccentColor();
			toasts.dismiss();

			setShowMobileNavigation(false);
		},
		onProfileSyncComplete: async () => {
			await toasts.dismiss();
			toasts.success(t("COMMON.PROFILE_SYNC_COMPLETED"));
		},
		onProfileSyncError: async (failedNetworkNames, retryProfileSync) => {
			await toasts.dismiss();

			toasts.warning(
				<SyncErrorMessage
					failedNetworkNames={failedNetworkNames}
					onRetry={async () => {
						await toasts.dismiss();
						retryProfileSync();
					}}
				/>,
			);
		},
		onProfileSyncStart: () => {
			toasts.warning(t("COMMON.PROFILE_SYNC_STARTED"), { autoClose: false });
		},
		onProfileUpdated: () => {
			history.replace("/");
		},
	});

	const handleError = useErrorHandler();

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
				handleError(error);
			}
		};

		boot();
	}, [env, handleError]);

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
