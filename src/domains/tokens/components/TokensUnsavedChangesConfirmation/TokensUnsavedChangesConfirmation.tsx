import React from "react";
import { ConfirmationModal } from "@/app/components/ConfirmationModal";
import { useNavigationBlocker } from "@/app/hooks/use-navigation-blocker";
import { useTokensPrompt } from "@/domains/tokens/hooks/use-tokens-prompt";

interface SettingsUnsavedChangesConfirmationProps {
	isDirty: boolean;
}

export const TokensUnsavedChangesConfirmation: React.FC<SettingsUnsavedChangesConfirmationProps> = ({ isDirty }) => {
	const { shouldBlockNavigation } = useTokensPrompt({ isDirty });

	const { isOpen, onConfirm, onCancel } = useNavigationBlocker({
		shouldBlock: ({ nextLocation }) => shouldBlockNavigation(nextLocation.pathname),
	});

	return <ConfirmationModal size="2xl" isOpen={isOpen} onConfirm={onConfirm} onCancel={onCancel} />;
};
