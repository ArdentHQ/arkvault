import { useTranslation } from "react-i18next";

export const TokensTableFooter = ({ tokensCount, columnsCount }: { tokensCount: number; columnsCount: number }) => {
	const { t } = useTranslation();

	if (tokensCount > 0) {
		return null;
	}

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
};
