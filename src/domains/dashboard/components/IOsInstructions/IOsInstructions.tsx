import React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/Button";
import { Image } from "@/app/components/Image";

export const IOsInstructions = ({ onClose }: { onClose: () => void }) => {
	const { t } = useTranslation();

	return (
		<div className="mt-8" data-testid="IOsInstructions">
			<div className="flex flex-col items-start">
				<div className="mb-4 font-semibold text-theme-secondary-text">{t("COMMON.INSTALL_ARKVAULT_STEP1")}</div>
				<Image name="IOsInstructionsStep1" className="mb-8 h-auto w-full" />

				<div className="mb-4 font-semibold text-theme-secondary-text">{t("COMMON.INSTALL_ARKVAULT_STEP2")}</div>
				<Image name="IOsInstructionsStep2" className="mb-8 h-auto w-full" />

				<div className="mb-4 font-semibold text-theme-secondary-text">{t("COMMON.INSTALL_ARKVAULT_STEP3")}</div>
				<Image name="IOsInstructionsStep3" className="h-auto w-full" />
			</div>

			<div className="mt-8 flex items-end justify-end">
				<Button type="submit" onClick={onClose} variant="secondary" data-testid="IOsInstructions__close-button">
					{t("COMMON.CLOSE")}
				</Button>
			</div>
		</div>
	);
};
