import { useCallback } from "react";
import { FieldNamesMarkedBoolean } from "react-hook-form";
import { matchPath } from "react-router-dom";
import { ProfilePaths } from "@/router/paths";

interface UseSettingsPromptInput<TFieldValues> {
	isDirty: boolean;
	// @ts-ignore
	dirtyFields: FieldNamesMarkedBoolean<TFieldValues>;
}

export const useSettingsPrompt = <TFieldValues>({ isDirty, dirtyFields }: UseSettingsPromptInput<TFieldValues>) => {
	const getPromptMessage = useCallback(
		(location: any) => {
			/* istanbul ignore next -- @preserve */
			const pathname = location.pathname || location.location?.pathname;

			const matchCurrent = matchPath(
				{
					caseSensitive: true,
					end: true,
					path: ProfilePaths.Settings,
				},
				pathname,
			);

			const isReload = matchCurrent !== null;

			if (isReload) {
				return true;
			}

			if (isDirty && Object.keys(dirtyFields).length > 0) {
				return "block";
			}

			return true;
		},
		[isDirty, dirtyFields],
	);

	return { getPromptMessage };
};
