import { Contracts } from "@/app/lib/profiles";
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import { useCallback, useEffect, useState } from "react";

export const useProfileTokens = ({ profile }: { profile: Contracts.IProfile }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [tokens, setTokens] = useState<WalletToken[]>([]);

	const reload = useCallback(async () => {
		setIsLoading(true);
		const response = await profile.tokens().selected();
		setTokens(response.items());
		setIsLoading(false);
	}, [profile, setIsLoading]);

	useEffect(() => {
		reload();
	}, [profile, reload]);

	return {
		isLoading,
		reload,
		tokens,
	};
};
