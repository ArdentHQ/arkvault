import React, { useMemo } from "react";
import { TableCell, TableRow } from "@/app/components/Table";

import { Contracts } from "@ardenthq/sdk-profiles";
import { ValidatorRowSkeleton } from "./ValidatorRowSkeleton";
import { ValidatorVoteAmount } from "./ValidatorVoteAmount";
import { ValidatorVoteButton } from "./ValidatorVoteButton";
import { Icon } from "@/app/components/Icon";
import { Link } from "@/app/components/Link";
import { Tooltip } from "@/app/components/Tooltip";
import { VoteValidatorProperties } from "@/domains/vote/components/ValidatorsTable/ValidatorsTable.contracts";
import cn from "classnames";
import { validatorExistsInVotes } from "@/domains/vote/components/ValidatorsTable/ValidatorsTable.helpers";
import { useTranslation } from "react-i18next";

export interface ValidatorRowProperties {
	index: number;
	validator: Contracts.IReadOnlyWallet;
	selectedUnvotes: VoteValidatorProperties[];
	selectedVotes: VoteValidatorProperties[];
	voted?: Contracts.VoteRegistryItem;
	isVoteDisabled?: boolean;
	isLoading?: boolean;
	selectedWallet: Contracts.IReadWriteWallet;
	availableBalance: number;
	setAvailableBalance: (balance: number) => void;
	toggleUnvotesSelected: (address: string, voteAmount?: number) => void;
	toggleVotesSelected: (address: string, voteAmount?: number) => void;
}

type UseValidatorRowProperties = Omit<ValidatorRowProperties, "isLoading" | "availableBalance" | "setAvailableBalance">;

export const useValidatorRow = ({
	index,
	voted,
	validator,
	selectedUnvotes,
	selectedVotes,
	isVoteDisabled = false,
	selectedWallet,
	toggleUnvotesSelected,
	toggleVotesSelected,
}: UseValidatorRowProperties) => {
	const { t } = useTranslation();

	const requiresStakeAmount = selectedWallet.network().votesAmountMinimum() > 0;

	const isSelectedUnvote = useMemo(
		() =>
			!!selectedUnvotes?.find((unvote) => {
				const isEqualToDelegate = unvote.validatorAddress === validator?.address?.();

				if (isEqualToDelegate && requiresStakeAmount) {
					return unvote.amount === voted?.amount;
				}

				return isEqualToDelegate;
			}),
		[validator, requiresStakeAmount, selectedUnvotes, voted],
	);

	const isSelectedVote = useMemo(
		() => !!voted || !!validatorExistsInVotes(selectedVotes, validator?.address?.()),
		[validator, voted, selectedVotes],
	);

	const isActive = useMemo(() => {
		const rank = validator?.rank?.();
		if (rank !== undefined) {
			return rank <= selectedWallet.network().delegateCount();
		}
		return false;
	}, [validator, selectedWallet]);

	const isChanged = useMemo(() => {
		const alreadyExistsInVotes = !!validatorExistsInVotes(selectedVotes, validator?.address?.());
		const alreadyExistsInUnvotes =
			!!validatorExistsInVotes(selectedUnvotes, validator?.address?.()) && !isSelectedUnvote;

		return !!voted && (alreadyExistsInVotes || alreadyExistsInUnvotes);
	}, [selectedVotes, selectedUnvotes, isSelectedUnvote, voted, validator]);

	const rowColor = useMemo(() => {
		if (isChanged) {
			return "bg-theme-warning-50 dark:bg-theme-background dark:border-theme-warning-600";
		}

		if (voted) {
			return isSelectedUnvote
				? "bg-theme-danger-50 dark:bg-theme-background dark:border-theme-danger-400"
				: "bg-theme-primary-50 dark:bg-theme-background dark:border-theme-primary-600";
		}

		if (isSelectedVote) {
			return "bg-theme-success-100 dark:bg-theme-background dark:border-theme-success-600";
		}
	}, [isChanged, voted, isSelectedVote, isSelectedUnvote]);

	const renderButton = () => {
		if (isChanged) {
			return (
				<ValidatorVoteButton
					index={index}
					variant="warning"
					compactClassName="text-theme-warning-700 hover:text-theme-warning-800"
					onClick={() => {
						if (validatorExistsInVotes(selectedVotes, validator?.address?.())) {
							toggleVotesSelected?.(validator.address());
						}

						toggleUnvotesSelected?.(validator.address(), voted!.amount);
					}}
				>
					{t("COMMON.CHANGED")}
				</ValidatorVoteButton>
			);
		}

		if (voted) {
			if (isSelectedUnvote) {
				return (
					<ValidatorVoteButton
						index={index}
						variant="danger"
						compactClassName={`
							bg-theme-danger-100 sm:bg-transparent
							dark:bg-theme-danger-400 dark:sm:bg-transparent
							text-theme-danger-400 hover:text-theme-danger-500
							dark:text-white dark:sm:text-theme-danger-400 dark:sm:hover:text-theme-danger-500
					`}
						onClick={() => toggleUnvotesSelected?.(validator.address())}
					>
						{t("COMMON.UNSELECTED")}
					</ValidatorVoteButton>
				);
			}

			return (
				<ValidatorVoteButton
					index={index}
					variant="primary"
					compactClassName={`
						bg-theme-navy-200 sm:bg-transparent
						dark:bg-theme-navy-800 dark:sm:bg-transparent
						text-theme-primary-600 hover:text-theme-primary-700
						dark:text-white dark:sm:text-theme-primary-600 dark:sm:hover:text-theme-primary-700
					`}
					onClick={() => toggleUnvotesSelected?.(validator.address())}
				>
					{t("COMMON.CURRENT")}
				</ValidatorVoteButton>
			);
		}

		if (isVoteDisabled && !isSelectedVote) {
			return (
				<ValidatorVoteButton
					index={index}
					disabled
					compactClassName={`
						bg-theme-secondary-100 sm:bg-transparent
						dark:bg-theme-secondary-800 dark:sm:bg-transparent
						text-black
						dark:text-theme-secondary-800 dark:sm:text-theme-black
					`}
				>
					{t("COMMON.SELECT")}
				</ValidatorVoteButton>
			);
		}

		if (isSelectedVote) {
			return (
				<ValidatorVoteButton
					index={index}
					variant="reverse"
					compactClassName={`
						bg-theme-success-100 sm:bg-transparent
						dark:bg-theme-success-600 dark:sm:bg-transparent
						text-theme-primary-reverse-600 hover:text-theme-primary-reverse-700
						dark:text-white dark:sm:text-theme-primary-reverse-600 dark:sm:hover:text-theme-primary-reverse-700
					`}
					onClick={() => toggleVotesSelected?.(validator.address())}
				>
					{t("COMMON.SELECTED")}
				</ValidatorVoteButton>
			);
		}

		return (
			<ValidatorVoteButton
				index={index}
				variant="secondary"
				compactClassName={`
					bg-theme-navy-100 sm:bg-transparent
					dark:bg-theme-secondary-800 dark:sm:bg-transparent
					text-theme-primary-600 hover:text-theme-primary-700
					dark:text-theme-secondary-200 dark:sm:text-theme-primary-600 dark:sm:hover:text-theme-primary-700
				`}
				onClick={() => toggleVotesSelected?.(validator.address())}
			>
				{t("COMMON.SELECT")}
			</ValidatorVoteButton>
		);
	};

	return {
		isActive,
		isChanged,
		isSelectedUnvote,
		isSelectedVote,
		renderButton,
		requiresStakeAmount,
		rowColor,
	};
};

export const ValidatorRow = ({
	index,
	voted,
	validator,
	selectedUnvotes,
	selectedVotes,
	isVoteDisabled = false,
	isLoading = false,
	selectedWallet,
	availableBalance,
	setAvailableBalance,
	toggleUnvotesSelected,
	toggleVotesSelected,
}: ValidatorRowProperties) => {
	const { t } = useTranslation();

	const { requiresStakeAmount, renderButton, isSelectedUnvote, rowColor, isSelectedVote, isActive } = useValidatorRow(
		{
			index,
			isVoteDisabled,
			selectedUnvotes,
			selectedVotes,
			selectedWallet,
			toggleUnvotesSelected,
			toggleVotesSelected,
			validator,
			voted,
		},
	);

	if (isLoading) {
		return <ValidatorRowSkeleton requiresStakeAmount={requiresStakeAmount} />;
	}

	return (
		<TableRow
			key={validator.address()}
			className="relative last:!border-b-4 last:border-solid last:border-theme-secondary-200 last:dark:border-theme-secondary-800"
		>
			<TableCell
				variant="start"
				innerClassName={cn(
					"ml-3 pl-3 text-sm leading-[17px] font-semibold border-2 border-r-0 border-transparent h-9 min-h-9 my-0",
					rowColor,
				)}
			>
				<span>{validator.rank()}</span>
			</TableCell>

			<TableCell
				innerClassName={cn(
					"font-semibold border-t-2 border-b-2 border-transparent text-sm leading-[17px] h-9 min-h-9 my-0 space-x-3",
					rowColor,
				)}
			>
				<div className="relative h-[17px] grow">
					<div className="absolute flex w-full items-center">
						<div className="truncate"> {validator.username()} </div>
					</div>
				</div>
			</TableCell>

			<TableCell
				className="hidden sm:table-cell"
				innerClassName={cn(
					"justify-center border-t-2 border-b-2 border-transparent h-9 min-h-9 my-0",
					rowColor,
				)}
			>
				{isActive ? (
					<Tooltip content={t("VOTE.VALIDATOR_TABLE.TOOLTIP.VALIDATOR_IN_FORGING_POSITION")}>
						<div>
							<Icon name="StatusOk" className="text-theme-navy-600" size="md" />
						</div>
					</Tooltip>
				) : (
					<Tooltip content={t("VOTE.VALIDATOR_TABLE.TOOLTIP.VALIDATOR_IN_STANDY_POSITION")}>
						<div>
							<Icon name="StatusStandby" className="text-theme-warning-500" size="md" />
						</div>
					</Tooltip>
				)}
			</TableCell>

			<TableCell
				className="hidden sm:table-cell"
				innerClassName={cn(
					"justify-center border-t-2 border-b-2 border-transparent text-sm leading-[17px] h-9 min-h-9 !my-0",
					rowColor,
				)}
			>
				<Link
					to={validator.explorerLink()}
					tooltip={t("COMMON.OPEN_IN_EXPLORER")}
					isExternal
					className="w-24 md:w-auto [&_svg]:text-theme-secondary-500 dark:[&_svg]:text-theme-secondary-700"
				>
					<span>{t("COMMON.VIEW")}</span>
				</Link>
			</TableCell>

			{requiresStakeAmount && (
				<ValidatorVoteAmount
					voted={voted}
					selectedWallet={selectedWallet}
					isSelectedVote={isSelectedVote}
					isSelectedUnvote={isSelectedUnvote}
					selectedVotes={selectedVotes}
					selectedUnvotes={selectedUnvotes}
					validatorAddress={validator.address()}
					availableBalance={availableBalance}
					setAvailableBalance={setAvailableBalance}
					toggleUnvotesSelected={toggleUnvotesSelected}
					toggleVotesSelected={toggleVotesSelected}
					rowColor={rowColor}
				/>
			)}

			<TableCell
				variant="end"
				className="w-30 min-w-32"
				innerClassName={cn(
					"justify-end pr-3 mr-3 border-2 border-l-0 border-transparent h-9 min-h-9",
					rowColor,
				)}
			>
				<div className="-mr-0.5 leading-[17px]">{renderButton()}</div>
			</TableCell>
		</TableRow>
	);
};
