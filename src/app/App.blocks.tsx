import { Global, css } from "@emotion/react";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { HashRouter, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useErrorHandler } from "react-error-boundary";
import { ToastContainer } from "react-toastify";
import { GlobalStyles as BaseStyles } from "twin.macro";

import { ConfirmationModal } from "@/app/components/ConfirmationModal";
import { useEnvironmentContext } from "@/app/contexts";
import { useAccentColor, useDeeplink, useNetworkStatus, useProfileSynchronizer, useTheme } from "@/app/hooks";
import { toasts } from "@/app/services";
import { SyncErrorMessage } from "@/app/components/ProfileSyncStatusMessage";
import { bootEnvironmentWithProfileFixtures, isE2E, isUnit } from "@/utils/test-helpers";
import { Splash } from "@/domains/splash/pages";
import { Offline } from "@/domains/error/pages";
import { middlewares, RouterView, routes } from "@/router";
import { PageSkeleton } from "@/app/components/PageSkeleton";

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
	const [showSplash, setShowSplash] = useState(true);
	const { env, persist, isEnvironmentBooted, setIsEnvironmentBooted } = useEnvironmentContext();
	const isOnline = useNetworkStatus();
	const history = useHistory();
	const { setTheme } = useTheme();
	const { resetAccentColor } = useAccentColor();

	const { t } = useTranslation();

	useProfileSynchronizer({
		onProfileRestoreError: () =>
			history.push({
				pathname: "/",
				state: {
					from: history.location.pathname + history.location.search ?? /* istanbul ignore next */ "",
				},
			}),
		onProfileSignOut: () => {
			setTheme("system");
			resetAccentColor();
			toasts.dismiss();
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

	useDeeplink();

	const handleError = useErrorHandler();

	useLayoutEffect(() => {
		const boot = async () => {
			try {
				/* istanbul ignore next */
				if (isE2E() || isUnit()) {
					await bootEnvironmentWithProfileFixtures({ env, shouldRestoreDefaultProfile: isUnit() });
					await persist();

					setIsEnvironmentBooted(true);
					setShowSplash(false);
					return;
				}

				/* istanbul ignore next */
				await env.verify();

				/* istanbul ignore next */
				await env.boot();

				setIsEnvironmentBooted(true);
			} catch (error) {
				handleError(error);
			}

			setShowSplash(false);
		};

		boot();
	}, [env, handleError]);

	const renderContent = () => {
		if (showSplash) {
			return <Splash />;
		}

		if (!isOnline) {
			return <Offline />;
		}

		/* istanbul ignore else */
		if (isEnvironmentBooted) {
			return <RouterView routes={routes} middlewares={middlewares} />;
		}
	};

	return (
		<main data-testid="Main">
			<ToastContainer closeOnClick={false} newestOnTop />

			{renderContent()}
		</main>
	);
};

export { AppRouter, GlobalStyles, Main };
