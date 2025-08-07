import React, { useEffect, useLayoutEffect, useRef } from "react";
import { createHashRouter, RouterProvider, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useErrorBoundary } from "react-error-boundary";
import { ToastContainer } from "react-toastify";

import { useConfiguration, useEnvironmentContext, useNavigationContext } from "@/app/contexts";
import { useNetworkStatus, useProfileSynchronizer, useProfileWatcher, useTheme } from "@/app/hooks";
import { toasts } from "@/app/services";
import { SyncErrorMessage } from "@/app/components/ProfileSyncStatusMessage";
import { bootEnvironmentWithProfileFixtures, isE2E, isUnit } from "@/utils/test-helpers";
import { Offline } from "@/domains/error/pages";
import { middlewares, RouterView, routes } from "@/router";
import { PageSkeleton } from "@/app/components/PageSkeleton";
import { ProfilePageSkeleton } from "@/app/components/PageSkeleton/ProfilePageSkeleton";
import { InstallPWA } from "@/domains/dashboard/components/InstallPWA";
import { useProfileBackgroundJobsRunner } from "./hooks/use-profile-background-jobs";

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

	useProfileBackgroundJobsRunner(profile)

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

export { AppRouter, Main };
