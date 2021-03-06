import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Alert } from "@/app/components/Alert";
import { Button } from "@/app/components/Button";
import { FormButtons } from "@/app/components/Form";
import { SelectFile } from "@/app/components/SelectFile";
import { ReadableFile } from "@/app/hooks/use-files";
import { useNavigationContext } from "@/app/contexts";
import { StepHeader } from "@/app/components/StepHeader";

interface SelectFileStepProperties {
	fileFormat: string;
	onFileFormatChange: (fileFormat: string) => void;
	onSelect: (file: ReadableFile) => void;
	onBack: () => void;
}

export const SelectFileStep = ({ onBack, onSelect, onFileFormatChange, fileFormat }: SelectFileStepProperties) => {
	const { t } = useTranslation();

	const { setShowMobileNavigation } = useNavigationContext();

	useEffect(() => {
		// Stick form buttons to bottom.
		setShowMobileNavigation(false);
	}, []);

	const handleBack = () => {
		if (fileFormat === ".json") {
			return onFileFormatChange(".wwe");
		}

		onBack();
	};

	return (
		<div className="mx-auto max-w-xl">
			<StepHeader
				title={t("PROFILE.IMPORT.TITLE")}
				subtitle={t("PROFILE.IMPORT.SELECT_FILE_STEP.DESCRIPTION", { fileFormat })}
			/>

			<SelectFile fileFormat={fileFormat} onSelect={onSelect} />

			{fileFormat === ".wwe" && (
				<p className="mt-6 text-center text-base text-theme-secondary-text">
					<span>{t("PROFILE.IMPORT.SELECT_FILE_STEP.LEGACY_IMPORT")} </span>
					<button
						type="button"
						onClick={() => onFileFormatChange(".json")}
						title={t("PROFILE.IMPORT.SELECT_FILE_STEP.CLICK_HERE")}
						data-testid="SelectFileStep__change-file"
						className="link ring-focus relative cursor-pointer font-semibold focus:outline-none"
						data-ring-focus-margin="-m-1"
					>
						{t("PROFILE.IMPORT.SELECT_FILE_STEP.CLICK_HERE")}
					</button>
				</p>
			)}

			{fileFormat === ".json" && (
				<div className="mt-6">
					<Alert>{t("PROFILE.IMPORT.SELECT_FILE_STEP.DEPRECATION_WARNING")}</Alert>
				</div>
			)}

			<FormButtons>
				<Button data-testid="SelectFileStep__back" variant="secondary" onClick={handleBack}>
					{t("COMMON.BACK")}
				</Button>
			</FormButtons>
		</div>
	);
};
