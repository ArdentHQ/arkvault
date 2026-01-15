import { useCallback } from "react";
import { matchPath } from "react-router-dom";
import { ProfilePaths } from "@/router/paths";

interface UseTokensPromptInput {
	isDirty: boolean;
}

export const useTokensPrompt = ({ isDirty, }: UseTokensPromptInput) => {
	const shouldBlockNavigation = useCallback(
		(path: string) => {
			// Check if user is navigating to the tokens page
			const matchCurrent = matchPath(
				{
					caseSensitive: true,
					end: true,
					path: ProfilePaths.Tokens,
				},
				path,
			);

			const isNavigatingToTokens= matchCurrent !== null;

			// Don't block if navigating to the tokens page.
			if (isNavigatingToTokens) {
				return false;
			}

			// Don't block if no unsaved changes.
			return isDirty;
		},
		[isDirty],
	);

	return { shouldBlockNavigation };
};
