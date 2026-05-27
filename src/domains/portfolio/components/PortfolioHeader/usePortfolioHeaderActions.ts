import { Panel, usePanels } from "@/app/contexts/Panels";

export function usePortfolioHeaderActions() {
	const { openPanel } = usePanels();

	const handleSendRegistration = (registrationType?: "validatorRegistration" | "usernameRegistration") => {
		if (registrationType === "validatorRegistration") {
			openPanel(Panel.SendValidatorRegistration);
		} else {
			openPanel(Panel.SendUsernameRegistration);
		}
	};

	const handleSendContractDeployment = () => {
		openPanel(Panel.SendContractDeployment);
	};

	const handleSendUsernameResignation = () => {
		openPanel(Panel.SendUsernameResignation);
	};

	const handleSendValidatorResignation = () => {
		openPanel(Panel.SendValidatorResignation);
	};

	return {
		handleSendContractDeployment,
		handleSendRegistration,
		handleSendUsernameResignation,
		handleSendValidatorResignation,
	};
}
