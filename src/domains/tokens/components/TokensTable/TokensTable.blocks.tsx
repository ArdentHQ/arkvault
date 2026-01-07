import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/Button";
import React from "react";

export const TokensTableFooter = ({
	tokensCount,
	columnsCount,
	hasMore,
	isLoadingMore,
	isLoading,
	fetchMore,
}: {
	tokensCount: number;
	columnsCount: number;
	hasMore: boolean;
	isLoading: boolean;
	isLoadingMore: boolean;
	fetchMore: () => Promise<void>;
}) => {
	const { t } = useTranslation();

	if (isLoading) {
		return;
	}

	if (hasMore) {
		return (
			<tr className="border-theme-secondary-200 dark:border-theme-secondary-800 dim:border-theme-dim-700 border-t border-solid md:border-b-4">
				<td colSpan={columnsCount} className="px-6 pt-3 pb-4">
					<Button
						data-testid="transactions__fetch-more-button"
						variant="secondary"
						className="w-full py-1.5 leading-5"
						disabled={isLoadingMore}
						onClick={() => fetchMore()}
					>
						{isLoadingMore ? t("COMMON.LOADING") : t("COMMON.LOAD_MORE")}
					</Button>
				</td>
			</tr>
		);
	}

	if (tokensCount === 0) {
		return (
			<tr
				data-testid="EmptyResults"
				className="border-theme-secondary-200 dark:border-theme-secondary-800 dim:border-theme-dim-700 border-solid md:border-b-4"
			>
				<td colSpan={columnsCount} className="pt-[11px] pb-4">
					<p className="text-theme-secondary-700 dark:text-theme-secondary-600 dim:text-theme-dim-500 px-6 py-4 text-center text-sm sm:py-0">
						{t("TOKENS.EMPTY_TOKENS")}
					</p>
				</td>
			</tr>
		);
	}
};
