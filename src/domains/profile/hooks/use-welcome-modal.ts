import { Contracts, Environment } from "@payvo/sdk-profiles";
import { useCallback, useEffect, useState } from "react";

import { useConfiguration } from "@/app/contexts";
import { WelcomeModalStep } from "@/domains/profile/components/WelcomeModal/WelcomeModal.contracts";

export const useWelcomeModal = (environment: Environment, profile: Contracts.IProfile) => {
	const [show, setShow] = useState<boolean>(false);
	const [step, setStep] = useState<WelcomeModalStep>(WelcomeModalStep.Introduction);
	const [showAgain, setShowAgain] = useState(true);
	const { profileIsSyncing } = useConfiguration();

	useEffect(() => {
		if (profileIsSyncing) {
			return;
		}

		setShow(!profile.hasCompletedIntroductoryTutorial());
	}, [profile, profileIsSyncing]);

	const onClose = useCallback(async () => {
		if (!showAgain || step === WelcomeModalStep.StepLast) {
			profile.markIntroductoryTutorialAsComplete();
		}

		setShow(false);

		await environment.persist();
	}, [environment, profile, showAgain, step]);

	const toggleShowAgain = () => {
		setShowAgain(!showAgain);
	};

	const goToNextStep = () => {
		setStep(step + 1);
	};

	const goToPreviousStep = () => {
		setStep(step - 1);
	};

	return {
		goToNextStep,
		goToPreviousStep,
		onClose,
		setStep,
		show,
		showAgain,
		step,
		toggleShowAgain,
	};
};
