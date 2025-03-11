import React from "react";
import { Button } from "@/app/components/Button";
import { StepIndicator } from "@/app/components/StepIndicator";
import { useTranslation } from "react-i18next";

enum Step {
	MethodStep = 1,
	ImportDetailStep = 2,
	EncryptPasswordStep,
	SummaryStep,
}

export const ImportActionToolbar = ({
	showSteps,
	activeTab,
	allSteps,
	onBack,
	onContinue,
	isLoading,
	isBackDisabled,
	isContinueDisabled,
	showButtons,
	isSubmitDisabled,
}: {
	showButtons?: boolean;
	isLoading?: boolean;
	showSteps?: boolean;
	activeTab: number;
	allSteps: string[];
	isContinueDisabled?: boolean;
	isBackDisabled?: boolean;
	isSubmitDisabled?: boolean;
	onBack?: () => void;
	onContinue?: () => void;
}) => {
	const { t } = useTranslation();
	return (
		<div className="fixed inset-x-0 bottom-0 mr-[5px] flex items-center justify-end bg-theme-background p-2 px-4 sm:justify-between sm:px-6 sm:py-6 md:px-8">
			{showSteps && (
				<div className="hidden w-[136px] sm:block">
					<StepIndicator steps={allSteps} activeIndex={activeTab} showTitle={false} />
				</div>
			)}

			<div className="flex w-full gap-3 sm:justify-end [&>button]:flex-1 sm:[&>button]:flex-none">
				{showButtons && (
					<>
						<Button
							disabled={isBackDisabled}
							variant="secondary"
							onClick={onBack}
							data-testid="ImportWallet__back-button"
						>
							{t("COMMON.BACK")}
						</Button>

						<Button
							disabled={isContinueDisabled}
							isLoading={isLoading}
							onClick={onContinue}
							data-testid="ImportWallet__continue-button"
						>
							{t("COMMON.CONTINUE")}
						</Button>
					</>
				)}

				{activeTab === Step.SummaryStep && (
					<Button disabled={isSubmitDisabled} type="submit" data-testid="ImportWallet__finish-button">
						{t("COMMON.GO_TO_PORTFOLIO")}
					</Button>
				)}
			</div>
		</div>
	);
};
