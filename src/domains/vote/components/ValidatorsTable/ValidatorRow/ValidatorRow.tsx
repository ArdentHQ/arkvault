import React, { useMemo } from "react";
import { TableCell, TableRow } from "@/app/components/Table";

import { Contracts } from "@/app/lib/profiles";
import { ValidatorRowSkeleton } from "./ValidatorRowSkeleton";
import { ValidatorVoteAmount } from "./ValidatorVoteAmount";
import { ValidatorVoteButton } from "./ValidatorVoteButton";
import { Link } from "@/app/components/Link";
import { Tooltip } from "@/app/components/Tooltip";
import { VoteValidatorProperties } from "@/domains/vote/components/ValidatorsTable/ValidatorsTable.contracts";
import cn from "classnames";
import { validatorExistsInVotes } from "@/domains/vote/components/ValidatorsTable/ValidatorsTable.helpers";
import { useTranslation } from "react-i18next";
import { Address } from "@/app/components/Address";
import { twMerge } from "tailwind-merge";

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

export enum ValidatorStatusEnum {
	Changed = "changed",
	Voted = "voted",
	Unvoted = "unvoted",
	Selected = "selected",
	Disabled = "disabled",
	Active = "active",
}

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
				const isEqualToValidator = unvote.validatorAddress === validator?.address?.();

				if (isEqualToValidator && requiresStakeAmount) {
					return unvote.amount === voted?.amount;
				}

				return isEqualToValidator;
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
			return rank <= selectedWallet.network().validatorCount();
		}
		return false;
	}, [validator, selectedWallet]);

	const isChanged = useMemo(() => {
		const alreadyExistsInVotes = !!validatorExistsInVotes(selectedVotes, validator?.address?.());
		const alreadyExistsInUnvotes =
			!!validatorExistsInVotes(selectedUnvotes, validator?.address?.()) && !isSelectedUnvote;

		return !!voted && (alreadyExistsInVotes || alreadyExistsInUnvotes);
	}, [selectedVotes, selectedUnvotes, isSelectedUnvote, voted, validator]);

	const status = useMemo<ValidatorStatusEnum>(() => {
		if (isChanged) {
			return ValidatorStatusEnum.Changed;
		}

		if (voted) {
			return isSelectedUnvote ? ValidatorStatusEnum.Unvoted : ValidatorStatusEnum.Voted;
		}

		if (isSelectedVote) {
			return ValidatorStatusEnum.Selected;
		}

		if (isVoteDisabled && !isSelectedVote) {
			return ValidatorStatusEnum.Disabled;
		}

		return ValidatorStatusEnum.Active;
	}, [isChanged, voted, isSelectedVote, isSelectedUnvote, isVoteDisabled]);

	const rowColor = useMemo(() => {
		if (status === ValidatorStatusEnum.Changed) {
			return "bg-theme-warning-50 dark:bg-theme-background dark:border-theme-warning-600";
		}

		if (status === ValidatorStatusEnum.Selected) {
			return "bg-theme-success-100 dark:bg-theme-background dark:border-theme-success-600";
		}

		if (status === ValidatorStatusEnum.Unvoted) {
			return "bg-theme-danger-50 dark:bg-theme-background dark:border-theme-danger-400";
		}

		if (status === ValidatorStatusEnum.Voted) {
			return "bg-theme-primary-50 dark:bg-theme-background dark:border-theme-primary-600";
		}
	}, [status]);

	const renderButton = () => {
		if (status === ValidatorStatusEnum.Changed) {
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

		if (status === ValidatorStatusEnum.Selected) {
			return (
				<ValidatorVoteButton
					index={index}
					variant="reverse"
					compactClassName={`
						bg-transparent
						dark:bg-theme-success-600 dark:bg-transparent
						text-theme-primary-reverse-600 hover:text-theme-primary-reverse-700
						dark:text-white dark:text-theme-primary-reverse-600 dark:hover:text-theme-primary-reverse-700
					`}
					onClick={() => toggleVotesSelected?.(validator.address())}
				>
					{t("COMMON.SELECTED")}
				</ValidatorVoteButton>
			);
		}

		if (status === ValidatorStatusEnum.Unvoted) {
			return (
				<ValidatorVoteButton
					index={index}
					variant="danger"
					compactClassName={`
							bg-transparent
							dark:bg-theme-danger-400 dark:bg-transparent
							text-theme-danger-400 hover:text-theme-danger-500
							dark:text-white dark:text-theme-danger-400 dark:hover:text-theme-danger-500
					`}
					onClick={() => toggleUnvotesSelected?.(validator.address())}
				>
					{t("COMMON.UNSELECTED")}
				</ValidatorVoteButton>
			);
		}

		if (status === ValidatorStatusEnum.Voted) {
			return (
				<ValidatorVoteButton
					index={index}
					variant="primary"
					compactClassName={`
						bg-transparent
						dark:bg-theme-navy-800 dark:bg-transparent
						text-theme-primary-600 hover:text-theme-primary-700
						dark:text-white dark:text-theme-primary-600 dark:hover:text-theme-primary-700
					`}
					onClick={() => toggleUnvotesSelected?.(validator.address())}
				>
					{t("COMMON.CURRENT")}
				</ValidatorVoteButton>
			);
		}

		if (status === ValidatorStatusEnum.Disabled) {
			return (
				<ValidatorVoteButton
					index={index}
					disabled
					compactClassName={`
						bg-transparent
						dark:bg-theme-secondary-800 dark:bg-transparent
						text-black
						dark:text-theme-secondary-800 dark:text-theme-black
					`}
				>
					{t("COMMON.SELECT")}
				</ValidatorVoteButton>
			);
		}

		return (
			<ValidatorVoteButton
				index={index}
				variant="secondary"
				compactClassName={`
					bg-transparent
					dark:bg-theme-secondary-800 dark:bg-transparent
					text-theme-primary-600 hover:text-theme-primary-700
					dark:text-theme-secondary-200 dark:text-theme-primary-600 dark:hover:text-theme-primary-700
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
		status,
	};
};

export const ValidatorStatus = ({ isActive, className }: { isActive: boolean; className?: string }) => {
	const { t } = useTranslation();

	const tooltipContent = isActive
		? t("VOTE.VALIDATOR_TABLE.TOOLTIP.VALIDATOR_IN_FORGING_POSITION")
		: t("VOTE.VALIDATOR_TABLE.TOOLTIP.VALIDATOR_IN_STANDY_POSITION");

	const statusText = isActive ? t("WALLETS.STATUS.ACTIVE") : t("WALLETS.STATUS.STANDBY");
	const testId = isActive ? "ValidatorStatus__active" : "ValidatorStatus__standby";

	return (
		<Tooltip content={tooltipContent}>
			<div
				data-testid={testId}
				className={twMerge(
					"bg-theme-secondary-200 text-theme-secondary-700 dark:border-theme-dark-700 dark:text-theme-dark-200 group-hover:bg-theme-secondary-300 inline-block min-w-[58px] rounded px-1 py-[3px] text-center text-xs font-semibold dark:border dark:bg-transparent dark:group-hover:bg-transparent",
					className,
				)}
			>
				{statusText}
			</div>
		</Tooltip>
	);
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
			className="last:border-theme-secondary-200 dark:last:border-theme-secondary-800 relative last:border-b-4! last:border-solid"
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
				<Address
					walletName={validator.username()}
					truncateOnTable
					address={validator.username() ? undefined : validator.address()}
					wrapperClass="justify-start"
					addressClass="leading-[17px] text-sm w-full"
				/>
			</TableCell>

			<TableCell
				className="hidden sm:table-cell"
				innerClassName={cn(
					"justify-center border-t-2 border-b-2 border-transparent h-9 min-h-9 my-0",
					rowColor,
				)}
			>
				<ValidatorStatus isActive={isActive} />
			</TableCell>

			<TableCell
				className="hidden sm:table-cell"
				innerClassName={cn(
					"justify-center border-t-2 border-b-2 border-transparent text-sm leading-[17px] h-9 min-h-9 my-0!",
					rowColor,
				)}
			>
				<Link
					to={validator.explorerLink()}
					tooltip={t("COMMON.OPEN_IN_EXPLORER")}
					isExternal
					className="[&_svg]:text-theme-secondary-500 dark:[&_svg]:text-theme-secondary-700 w-24 md:w-auto"
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
