import React from "react";
import { useTranslation } from "react-i18next";

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
	const { t } = useTranslation();
	const { shouldBlockNavigation } = useSettingsPrompt({ dirtyFields, isDirty });

	const { isOpen, onConfirm, onCancel } = useNavigationBlocker({
		shouldBlock: ({ nextLocation }) => {
			return shouldBlockNavigation(nextLocation.pathname);
		},
	});

	return (
		<ConfirmationModal
			isOpen={isOpen}
			onConfirm={onConfirm}
			onCancel={onCancel}
			title={t("SETTINGS.UNSAVED_CHANGES.TITLE")}
			description={t("SETTINGS.UNSAVED_CHANGES.DESCRIPTION")}
		/>
	);
};
