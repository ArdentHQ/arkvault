import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export const useTransactionQueryParameters = () => {
	const { search } = useLocation();

	const originalQueryParameters = useMemo(() => new URLSearchParams(search), [search]);

	const queryParameters = useMemo<Record<string, string>>(() => {
		const result: Record<string, string> = {};
		for (const [key, value] of originalQueryParameters.entries()) {
			if (key !== "reset") {
				result[key] = value;
			}
		}
		return result;
	}, [originalQueryParameters]);
	const hasAnyParameters = useMemo(() => Object.keys(queryParameters).length > 0, [queryParameters]);

	return {
		hasAnyParameters,
		hasReset: originalQueryParameters.get("reset") === "1",
		queryParameters,
	};
};
