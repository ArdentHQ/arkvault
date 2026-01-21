import { Contracts } from "@/app/lib/profiles";
import { useCallback, useEffect, useState } from "react";

export const useProfileTokens = ({ profile }: { profile: Contracts.IProfile }) => {
	const [isLoading, setIsLoading] = useState(false);

	const reload = useCallback(async () => {
		setIsLoading(true);
		await profile.tokens().sync();
		setIsLoading(false);
	}, [profile, setIsLoading]);

	useEffect(() => {
		if (isLoading) {
			return
		}

		if (profile.tokens().selectedCount() > 0) {
			return
		}

		reload();
	}, [profile, reload]);

	return {
		isLoading,
		reload,
		tokens: profile.tokens().selected().items(),
	};
};
