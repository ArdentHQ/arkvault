import React from "react";
import { useTranslation } from "react-i18next";
import { usePwa } from "@/app/hooks/use-pwa";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { Modal } from "@/app/components/Modal";
import { IOsInstructions } from "@/domains/dashboard/components/IOsInstructions";

export const InstallPWA = () => {
	const { t } = useTranslation();
	const { installPrompt, showInstallBanner, hideInstallBanner, showIOSInstructions, setShowIOSInstructions } =
		usePwa();

	if (!showInstallBanner && !showIOSInstructions) {
		return <></>;
	}

	return (
		<div>
			{showInstallBanner && (
				<div
					data-testid="InstallPWA"
					className="fixed bottom-0 left-1/2 z-50 flex w-full -translate-x-1/2 flex-col items-stretch overflow-hidden bg-theme-primary-50 px-8 text-theme-secondary-900 dark:bg-theme-secondary-800 sm:flex-row sm:px-0 md:mb-4 md:max-w-xl md:rounded-xl"
				>
					<button
						data-testid="InstallPWA__close"
						type="button"
						onClick={hideInstallBanner}
						className="flex shrink-0 items-center justify-center p-4 text-theme-primary-600 hover:bg-theme-primary-100 hover:text-theme-primary-700 dark:hover:bg-theme-secondary-900"
					>
						<Icon name="Cross" size="md" />
					</button>

					<div className="mb-4 sm:mb-0 sm:py-4">
						<div className="w-full border-b border-theme-secondary-300 dark:border-theme-secondary-700 sm:h-full sm:w-auto sm:border-l" />
					</div>

					<div className="mx-auto flex max-w-60 flex-grow flex-col justify-center text-center text-theme-text sm:max-w-full sm:px-4 sm:text-left">
						<div>
							<span className="font-semibold">ARK</span>VAULT
						</div>
						<div className="text-sm text-theme-text">{t("PROFILE.INSTALL_PWA.MESSAGE")}</div>
					</div>
					<div className="flex items-center px-4 py-4.5">
						<Button
							data-testid="InstallPWA__install"
							variant="primary"
							className="w-full"
							onClick={installPrompt}
						>
							<div className="flex items-center space-x-2">
								<Icon name="Download" size="md" />
								<span>{t("COMMON.INSTALL")}</span>
							</div>
						</Button>
					</div>
				</div>
			)}

			<Modal
				size="lg"
				title={t("COMMON.INSTALL_ARKVAULT")}
				description={t("PROFILE.INSTALL_PWA.MESSAGE")}
				isOpen={showIOSInstructions}
				onClose={() => setShowIOSInstructions(false)}
			>
				<IOsInstructions onClose={() => setShowIOSInstructions(false)} />
			</Modal>
		</div>
	);
};
