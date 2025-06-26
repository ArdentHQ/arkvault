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
					className="bg-theme-primary-50 text-theme-secondary-900 dark:bg-theme-secondary-800 dim:bg-theme-dim-800 fixed bottom-0 left-1/2 z-50 flex w-full -translate-x-1/2 flex-col items-stretch overflow-hidden px-8 sm:flex-row sm:px-0 md:mb-4 md:max-w-xl md:rounded-xl"
				>
					<button
						data-testid="InstallPWA__close"
						type="button"
						onClick={hideInstallBanner}
						className="text-theme-primary-600 dark:hover:bg-theme-secondary-900 hover:bg-theme-primary-100 hover:text-theme-primary-700 dim-hover:bg-theme-dim-900 dim-hover:text-theme-navy-600 flex shrink-0 cursor-pointer items-center justify-center p-4"
					>
						<Icon name="Cross" size="md" />
					</button>

					<div className="mb-4 sm:mb-0 sm:py-4">
						<div className="border-theme-secondary-300 dark:border-theme-secondary-700 dim:border-theme-dim-700 w-full border-b sm:h-full sm:w-auto sm:border-l" />
					</div>

					<div className="text-theme-text mx-auto flex max-w-60 grow flex-col justify-center text-center sm:max-w-full sm:px-4 sm:text-left">
						<div>
							<span className="font-semibold">ARK</span>VAULT
						</div>
						<div className="text-theme-text text-sm">{t("PROFILE.INSTALL_PWA.MESSAGE")}</div>
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
