/* eslint-disable max-lines-per-function */
import { Contracts, Environment } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/app/components/Button";
import { Checkbox } from "@/app/components/Checkbox";
import { DotNavigation } from "@/app/components/DotNavigation";
import { FormButtons } from "@/app/components/Form";
import { Image } from "@/app/components/Image";
import { Modal } from "@/app/components/Modal";
import { useWelcomeModal } from "@/domains/profile/hooks/use-welcome-modal";

import { WelcomeModalStep } from "./WelcomeModal.contracts";

const Banner = ({ step }: { step: WelcomeModalStep }) => {
	if (step > WelcomeModalStep.Introduction) {
		return (
			<div className="-mx-10 my-8 border-b border-t border-theme-secondary-300 dark:border-theme-secondary-800">
				<Image name={`WelcomeModalStep${step - 1}`} domain="profile" className="h-auto w-full" />
			</div>
		);
	}

	return <Image name="WelcomeModalBanner" domain="profile" className="my-8" />;
};

export const WelcomeModal = ({ environment, profile }: { environment: Environment; profile: Contracts.IProfile }) => {
	const { t } = useTranslation();

	const { show, showAgain, toggleShowAgain, onClose, goToNextStep, setStep, goToPreviousStep, step } =
		useWelcomeModal(environment, profile);

	return (
		<Modal
			title={t(`PROFILE.MODAL_WELCOME.STEP_${step}.TITLE`)}
			image={<Banner step={step} />}
			isOpen={show}
			onClose={onClose}
		>
			<div className="w-full">
				<div className="text-base leading-7 text-theme-secondary-text">
					<p>{t(`PROFILE.MODAL_WELCOME.STEP_${step}.DESCRIPTION`)}</p>
				</div>

				<div className="flex items-center justify-between sm:space-x-3">
					{step === WelcomeModalStep.Introduction ? (
						<label className="mt-8 inline-flex cursor-pointer items-center space-x-3 text-sm text-theme-secondary-500 dark:text-theme-secondary-700">
							<Checkbox checked={!showAgain} onChange={toggleShowAgain} />
							<span>{t("PROFILE.MODAL_WELCOME.DONT_SHOW_CHECKBOX_LABEL")}</span>
						</label>
					) : (
						<div className="mt-8 hidden sm:flex">
							<DotNavigation
								size={WelcomeModalStep.StepLast - 1}
								activeIndex={step - 2}
								onClick={(step: WelcomeModalStep) => setStep(step + 2)}
							/>
						</div>
					)}

					{step === WelcomeModalStep.Introduction ? (
						<FormButtons>
							<Button variant="secondary" onClick={onClose} data-testid="WelcomeModal-skip">
								{t("COMMON.SKIP")}
							</Button>

							<Button onClick={goToNextStep} data-testid="WelcomeModal-next">
								{t("COMMON.START")}
							</Button>
						</FormButtons>
					) : (
						<FormButtons>
							<Button variant="secondary" onClick={goToPreviousStep} data-testid="WelcomeModal-prev">
								{t("COMMON.PREV")}
							</Button>

							{step < WelcomeModalStep.StepLast ? (
								<Button onClick={goToNextStep} data-testid="WelcomeModal-next">
									{t("COMMON.NEXT")}
								</Button>
							) : (
								<Button onClick={onClose} data-testid="WelcomeModal-finish">
									{t("COMMON.FINISH")}
								</Button>
							)}
						</FormButtons>
					)}
				</div>
			</div>
		</Modal>
	);
};
