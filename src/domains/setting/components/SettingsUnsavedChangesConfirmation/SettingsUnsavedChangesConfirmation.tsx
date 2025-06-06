import React from "react";
import { ConfirmationModal } from "@/app/components/ConfirmationModal";
import { useNavigationBlocker } from "@/app/hooks/use-navigation-blocker";
import { useSettingsPrompt } from "@/domains/setting/hooks/use-settings-prompt";

interface SettingsUnsavedChangesConfirmationProps {
	isDirty: boolean;
	dirtyFields: object;
}

export const SettingsUnsavedChangesConfirmation: React.FC<SettingsUnsavedChangesConfirmationProps> = ({
	isDirty,
	dirtyFields,
}) => {
	const { shouldBlockNavigation } = useSettingsPrompt({ dirtyFields, isDirty });

	const { isOpen, onConfirm, onCancel } = useNavigationBlocker({
		shouldBlock: ({ nextLocation }) => shouldBlockNavigation(nextLocation.pathname),
	});

	return <ConfirmationModal isOpen={isOpen} onConfirm={onConfirm} onCancel={onCancel} />;
};
