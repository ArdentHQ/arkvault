import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "react-table";
import { Table } from "@/app/components/Table";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import { SearchableTableWrapper } from "@/app/components/SearchableTableWrapper";
import { Toggle } from "@/app/components/Toggle";
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import { TokensTableFooter } from "./TokensTable.blocks";

export const TokensTable = () => {
	const { isMdAndAbove, isXs, isSmAndAbove } = useBreakpoint();
	const activeProfile = useActiveProfile();
	const [query, setQuery] = useState("");
	const tokens = activeProfile.tokens().selected();

	const { t } = useTranslation();

	const listColumns = useMemo<Column<WalletToken>[]>(
		() => [
			{
				Header: t("COMMON.NAME"),
				accessor: "name",
				cellWidth: "w-48 xl:w-40",
				headerClassName: "no-border",
				noRoundedBorders: true,
			},
			{
				Header: t("COMMON.SYMBOL"),
				cellWidth: "w-48 xl:w-40",
				headerClassName: "no-border",
			},
			{
				Header: t("COMMON.TOKEN_BALANCE"),
				cellWidth: "w-48 xl:w-40",
				headerClassName: "no-border",
			},
			{
				Header: t("COMMON.CURRENCY"),
				headerClassName: "no-border",
				minimumWidth: true,
			},
		],
		[t],
	);

	const renderTableRow = () => (
		<tr>
			<td>TODO: add token row</td>{" "}
		</tr>
	);

	const shouldRenderTable = (isXs && tokens.count() > 0) || isSmAndAbove;

	return (
		<>
			{isXs && tokens.count() === 0 && (
				<p
					data-testid="NoResultsMessage"
					className="text-theme-secondary-700 dark:text-theme-secondary-600 dim:text-theme-dim-500 p-4 px-6 text-center text-sm"
				>
					{t("TOKENS.EMPTY_TOKENS")}
				</p>
			)}

			{shouldRenderTable && (
				<SearchableTableWrapper
					innerClassName="lg:pb-28 md:pb-18 sm:pb-16 pb-18"
					searchQuery={query}
					setSearchQuery={setQuery}
					searchPlaceholder={t("TOKENS.ENTER_TOKEN_NAME")}
					extra={
						<div className="mr-6 flex items-center space-x-2">
							<div className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 font-semibold whitespace-nowrap">
								{t("TOKENS.HIDE_DUST")}
							</div>

							<Toggle
								disabled
								name="hideDust"
								defaultChecked={false}
								data-testid="Tokens__toggle-Toggle"
							/>
						</div>
					}
				>
					<div data-testid="TokenList">
						<Table
							columns={listColumns}
							data={tokens.values()}
							className="with-x-padding"
							footer={
								<TokensTableFooter tokensCount={tokens.count()} columnsCount={listColumns.length} />
							}
							hideHeader={!isMdAndAbove}
						>
							{renderTableRow}
						</Table>
					</div>
				</SearchableTableWrapper>
			)}
		</>
	);
};
