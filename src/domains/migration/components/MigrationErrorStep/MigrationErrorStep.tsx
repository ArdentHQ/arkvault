import React from "react";
import { useTranslation } from "react-i18next";

import { Header } from "@/app/components/Header";
import { ErrorStep } from "@/domains/transaction/components/ErrorStep";

interface MigrationErrorStepProperties {
	onBack?: () => void;
	onRepeat?: () => void;
	errorMessage?: string;
	isRepeatDisabled?: boolean;
}

export const MigrationErrorStep: React.FC<MigrationErrorStepProperties> = ({
	onBack,
	onRepeat,
	errorMessage = "test error message",
	isRepeatDisabled,
}) => {
	const { t } = useTranslation();

	return (
		<>
			<Header title={t("MIGRATION.MIGRATION_ADD.STEP_ERROR.TITLE")} className="text-lg sm:text-2xl" />

			<div className="mt-6 space-y-8">
				<ErrorStep
					onBack={onBack}
					isRepeatDisabled={isRepeatDisabled}
					onRepeat={onRepeat}
					errorMessage={errorMessage}
					noHeading
				/>
			</div>
		</>
	);
};
