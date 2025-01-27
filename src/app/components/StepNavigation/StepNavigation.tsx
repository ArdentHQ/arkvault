import React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/Button";
import { FormButtons } from "@/app/components/Form";

interface StepNavigationProperties {
	onBackClick: () => void;
	onBackToWalletClick: () => void;
	onContinueClick: () => void;
	onSend?: () => void;
	isNextDisabled: boolean;
	isLoading: boolean;
	activeIndex: number;
	size: number;
}

export const StepNavigation: React.VFC<StepNavigationProperties> = ({
	onBackClick,
	onBackToWalletClick,
	onContinueClick,
	isNextDisabled,
	isLoading,
	activeIndex,
	onSend,
	size,
}) => {
	const { t } = useTranslation();

	const showBack = activeIndex < size;
	const showBackToWallet = activeIndex === size;
	const showContinue = activeIndex < size - 1;
	const showSend = activeIndex === size - 1;

	return (
		<FormButtons>
			{showBack && (
				<Button
					disabled={isLoading}
					data-testid="StepNavigation__back-button"
					variant="secondary"
					onClick={onBackClick}
				>
					{t("COMMON.BACK")}
				</Button>
			)}

			{showBackToWallet && (
				<Button
					data-testid="StepNavigation__back-to-wallet-button"
					variant="secondary"
					onClick={onBackToWalletClick}
				>
					{t("COMMON.BACK_TO_WALLET")}
				</Button>
			)}

			{showContinue && (
				<Button
					data-testid="StepNavigation__continue-button"
					disabled={isNextDisabled || isLoading}
					isLoading={isLoading}
					onClick={onContinueClick}
				>
					{t("COMMON.CONTINUE")}
				</Button>
			)}

			{showSend && (
				<Button
					type="submit"
					data-testid="StepNavigation__send-button"
					disabled={isNextDisabled || isLoading}
					isLoading={isLoading}
					icon="DoubleArrowRight"
					onClick={onSend}
					iconPosition="right"
				>
					<span>{t("COMMON.SEND")}</span>
				</Button>
			)}
		</FormButtons>
	);
};
