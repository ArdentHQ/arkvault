import React from "react";
import { ConfirmationModal } from "@/app/components/ConfirmationModal";
import { useNavigationBlocker } from "@/app/hooks/use-navigation-blocker";

interface SettingsUnsavedChangesConfirmationProps {
	isDirty: boolean;
}

export const TokensUnsavedChangesConfirmation: React.FC<SettingsUnsavedChangesConfirmationProps> = ({ isDirty }) => {
	const { isOpen, onConfirm, onCancel } = useNavigationBlocker({
		shouldBlock: () => isDirty,
	});

	return <ConfirmationModal isOpen={isOpen} onConfirm={onConfirm} onCancel={onCancel} />;
};
