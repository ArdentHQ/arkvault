import { useCallback } from "react";
import { matchPath } from "react-router-dom";
import { ProfilePaths } from "@/router/paths";

interface UseSettingsPromptInput {
	isDirty: boolean;
	dirtyFields: object;
}

export const useSettingsPrompt = ({ isDirty, dirtyFields }: UseSettingsPromptInput) => {
	const shouldBlockNavigation = useCallback(
		(path: string) => {

			// Check if user is navigating to the settings page
			const matchCurrent = matchPath(
				{
					caseSensitive: true,
					end: true,
					path: ProfilePaths.Settings,
				},
				path,
			);

			const isNavigatingToSettings = matchCurrent !== null;

			// Don't block if navigating to the settings page.
			if (isNavigatingToSettings) {
				return false;
			}

			// Block navigation if there are unsaved changes
			if (isDirty && Object.keys(dirtyFields).length > 0) {
				return true; // Block navigation
			}

			// Don't block if no unsaved changes.
			return false;
		},
		[isDirty, dirtyFields],
	);

	return { shouldBlockNavigation };
};
