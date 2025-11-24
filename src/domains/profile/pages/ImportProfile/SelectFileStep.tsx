import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/Button";
import { FormButtons } from "@/app/components/Form";
import { SelectFile } from "@/app/components/SelectFile";
import { ReadableFile } from "@/app/hooks/use-files";
import { useNavigationContext } from "@/app/contexts";
import { StepHeader } from "@/app/components/StepHeader";
import { ThemeIcon } from "@/app/components/Icon";

interface SelectFileStepProperties {
	fileFormat: string;
	onFileFormatChange: (fileFormat: string) => void;
	onSelect: (file: ReadableFile) => void;
	onBack: () => void;
}

export const SelectFileStep = ({ onBack, onSelect, fileFormat }: SelectFileStepProperties) => {
	const { t } = useTranslation();

	const { setShowMobileNavigation } = useNavigationContext();

	useEffect(() => {
		// Stick form buttons to the bottom.
		setShowMobileNavigation(false);
	}, []);

	return (
		<div className="mx-auto max-w-xl">
			<StepHeader
				titleIcon={
					<ThemeIcon
						darkIcon="ImportProfileDark"
						lightIcon="ImportProfileLight"
						dimIcon="ImportProfileDim"
						dimensions={[24, 24]}
					/>
				}
				title={t("PROFILE.IMPORT.TITLE")}
				subtitle={t("PROFILE.IMPORT.SELECT_FILE_STEP.DESCRIPTION", { fileFormat })}
			/>

			<SelectFile fileFormat={fileFormat} onSelect={onSelect} />

			<FormButtons className="border-none">
				<Button data-testid="SelectFileStep__back" variant="secondary" onClick={onBack}>
					{t("COMMON.BACK")}
				</Button>
			</FormButtons>
		</div>
	);
};
