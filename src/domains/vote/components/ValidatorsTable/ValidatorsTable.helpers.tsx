import { Contracts } from "@/app/lib/profiles";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "react-table";

import { ValidatorsTableColumnsProperties, VoteValidatorProperties } from "./ValidatorsTable.contracts";

export const useValidatorsTableColumns = ({ network, isLoading }: ValidatorsTableColumnsProperties) => {
	const { t } = useTranslation();

	return useMemo<Column<Contracts.IReadOnlyWallet>[]>(() => {
		const templateColumns: Column<Contracts.IReadOnlyWallet>[] = [
			{
				Header: (
					<>
						<span className="hidden sm:inline">{t("COMMON.RANK")}</span>
						<span className="sm:hidden">#</span>
					</>
				),
				accessor: "rank",
				headerClassName: "no-border",
				minimumWidth: true,
				noRoundedBorders: true,
			},
			{
				Header: t("VOTE.VALIDATOR_TABLE.NAME"),
				accessor: (validator) => isLoading || validator.username(),
				className: "justify-start",
				headerClassName: "w-3/4 sm:w-auto, no-border",
			},
			{
				Header: t("COMMON.STATUS"),
				accessor: "status",
				className: "justify-center",
				disableSortBy: true,
				headerClassName: "hidden sm:table-cell no-border",
				minimumWidth: true,
			},
			{
				Header: t("COMMON.EXPLORER"),
				accessor: (validator) => isLoading || validator.explorerLink(),
				className: "justify-center",
				disableSortBy: true,
				headerClassName: "hidden sm:table-cell no-border",
				minimumWidth: true,
			},
			{
				accessor: () => "onSelect",
				className: "justify-end",
				disableSortBy: true,
				headerClassName: "no-border",
				id: "onSelect",
				noRoundedBorders: true,
			}
		];

		return templateColumns;
	}, [t, network, isLoading]);
};

export const validatorExistsInVotes = (
	votes: VoteValidatorProperties[],
	address: string,
): VoteValidatorProperties | undefined => votes.find(({ validatorAddress }) => validatorAddress === address);
