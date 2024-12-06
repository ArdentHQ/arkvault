import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "react-table";

import { ValidatorsTableColumnsProperties, VoteValidatorProperties } from "./ValidatorsTable.contracts";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";

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
			},
			{
				Header: t("VOTE.VALIDATOR_TABLE.NAME"),
				accessor: (delegate) => isLoading || delegate.username(),
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
				accessor: (delegate) => isLoading || delegate.explorerLink(),
				className: "justify-center",
				disableSortBy: true,
				headerClassName: "hidden sm:table-cell no-border",
				minimumWidth: true,
			},
		];

		if (network.votesAmountMinimum() > 0) {
			templateColumns.push({
				Header: (
					<div className="flex items-center space-x-3 px-3">
						<p>{t("VOTE.VALIDATOR_TABLE.VOTE_AMOUNT.TITLE")}</p>
						<Tooltip
							content={t("VOTE.VALIDATOR_TABLE.VOTE_AMOUNT.TOOLTIP", {
								coinId: network.coin(),
							})}
						>
							<span className="rounded-full bg-theme-primary-100 p-1 text-theme-primary-600 dark:bg-theme-secondary-800 dark:text-theme-secondary-200">
								<Icon name="QuestionMarkSmall" size="sm" />
							</span>
						</Tooltip>
					</div>
				),
				accessor: () => "voteAmount",
				className: "justify-end",
				disableSortBy: true,
				headerClassName: "no-border",
				id: "voteAmount",
			} as Column<Contracts.IReadOnlyWallet>);
		}

		templateColumns.push({
			accessor: () => "onSelect",
			className: "justify-end",
			disableSortBy: true,
			headerClassName: "no-border",
			id: "onSelect",
		});

		return templateColumns;
	}, [t, network, isLoading]);
};

export const validatorExistsInVotes = (
	votes: VoteValidatorProperties[],
	address: string,
): VoteValidatorProperties | undefined => votes.find(({ validatorAddress }) => validatorAddress === address);
