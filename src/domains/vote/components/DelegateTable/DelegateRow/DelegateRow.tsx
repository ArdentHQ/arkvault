import React, { useMemo } from "react";
import { TableCell, TableRow } from "@/app/components/Table";

import { Contracts } from "@ardenthq/sdk-profiles";
import { DelegateRowSkeleton } from "./DelegateRowSkeleton";
import { DelegateVoteAmount } from "./DelegateVoteAmount";
import { DelegateVoteButton } from "./DelegateVoteButton";
import { Icon } from "@/app/components/Icon";
import { Link } from "@/app/components/Link";
import { Tooltip } from "@/app/components/Tooltip";
import { VoteDelegateProperties } from "@/domains/vote/components/DelegateTable/DelegateTable.contracts";
import cn from "classnames";
import { delegateExistsInVotes } from "@/domains/vote/components/DelegateTable/DelegateTable.helpers";
import { useTranslation } from "react-i18next";
import { Address } from "@/app/components/Address";

export interface DelegateRowProperties {
	index: number;
	delegate: Contracts.IReadOnlyWallet;
	selectedUnvotes: VoteDelegateProperties[];
	selectedVotes: VoteDelegateProperties[];
	voted?: Contracts.VoteRegistryItem;
	isVoteDisabled?: boolean;
	isLoading?: boolean;
	selectedWallet: Contracts.IReadWriteWallet;
	availableBalance: number;
	setAvailableBalance: (balance: number) => void;
	toggleUnvotesSelected: (address: string, voteAmount?: number) => void;
	toggleVotesSelected: (address: string, voteAmount?: number) => void;
}

type UseDelegateRowProperties = Omit<DelegateRowProperties, "isLoading" | "availableBalance" | "setAvailableBalance">;

export const useDelegateRow = ({
	index,
	voted,
	delegate,
	selectedUnvotes,
	selectedVotes,
	isVoteDisabled = false,
	selectedWallet,
	toggleUnvotesSelected,
	toggleVotesSelected,
}: UseDelegateRowProperties) => {
	const { t } = useTranslation();

	const requiresStakeAmount = selectedWallet.network().votesAmountMinimum() > 0;

	const isSelectedUnvote = useMemo(
		() =>
			!!selectedUnvotes?.find((unvote) => {
				const isEqualToDelegate = unvote.delegateAddress === delegate?.address?.();

				if (isEqualToDelegate && requiresStakeAmount) {
					return unvote.amount === voted?.amount;
				}

				return isEqualToDelegate;
			}),
		[delegate, requiresStakeAmount, selectedUnvotes, voted],
	);

	const isSelectedVote = useMemo(
		() => !!voted || !!delegateExistsInVotes(selectedVotes, delegate?.address?.()),
		[delegate, voted, selectedVotes],
	);

	const isActive = useMemo(() => {
		const rank = delegate?.rank?.();
		if (rank !== undefined) {
			return rank <= selectedWallet.network().delegateCount();
		}
		return false;
	}, [delegate, selectedWallet]);

	const isChanged = useMemo(() => {
		const alreadyExistsInVotes = !!delegateExistsInVotes(selectedVotes, delegate?.address?.());
		const alreadyExistsInUnvotes =
			!!delegateExistsInVotes(selectedUnvotes, delegate?.address?.()) && !isSelectedUnvote;

		return !!voted && (alreadyExistsInVotes || alreadyExistsInUnvotes);
	}, [selectedVotes, selectedUnvotes, isSelectedUnvote, voted, delegate]);

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
				<DelegateVoteButton
					index={index}
					variant="warning"
					compactClassName="text-theme-warning-700 hover:text-theme-warning-800"
					onClick={() => {
						if (delegateExistsInVotes(selectedVotes, delegate?.address?.())) {
							toggleVotesSelected?.(delegate.address());
						}

						toggleUnvotesSelected?.(delegate.address(), voted!.amount);
					}}
				>
					{t("COMMON.CHANGED")}
				</DelegateVoteButton>
			);
		}

		if (voted) {
			if (isSelectedUnvote) {
				return (
					<DelegateVoteButton
						index={index}
						variant="danger"
						compactClassName={`
							bg-theme-danger-100 sm:bg-transparent
							dark:bg-theme-danger-400 dark:sm:bg-transparent
							text-theme-danger-400 hover:text-theme-danger-500
							dark:text-white dark:sm:text-theme-danger-400 dark:sm:hover:text-theme-danger-500
					`}
						onClick={() => toggleUnvotesSelected?.(delegate.address())}
					>
						{t("COMMON.UNSELECTED")}
					</DelegateVoteButton>
				);
			}

			return (
				<DelegateVoteButton
					index={index}
					variant="primary"
					compactClassName={`
						bg-theme-navy-200 sm:bg-transparent
						dark:bg-theme-navy-800 dark:sm:bg-transparent
						text-theme-primary-600 hover:text-theme-primary-700
						dark:text-white dark:sm:text-theme-primary-600 dark:sm:hover:text-theme-primary-700
					`}
					onClick={() => toggleUnvotesSelected?.(delegate.address())}
				>
					{t("COMMON.CURRENT")}
				</DelegateVoteButton>
			);
		}

		if (isVoteDisabled && !isSelectedVote) {
			return (
				<DelegateVoteButton
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
				</DelegateVoteButton>
			);
		}

		if (isSelectedVote) {
			return (
				<DelegateVoteButton
					index={index}
					variant="reverse"
					compactClassName={`
						bg-theme-success-100 sm:bg-transparent
						dark:bg-theme-success-600 dark:sm:bg-transparent
						text-theme-primary-reverse-600 hover:text-theme-primary-reverse-700
						dark:text-white dark:sm:text-theme-primary-reverse-600 dark:sm:hover:text-theme-primary-reverse-700
					`}
					onClick={() => toggleVotesSelected?.(delegate.address())}
				>
					{t("COMMON.SELECTED")}
				</DelegateVoteButton>
			);
		}

		return (
			<DelegateVoteButton
				index={index}
				variant="secondary"
				compactClassName={`
					bg-theme-navy-100 sm:bg-transparent
					dark:bg-theme-secondary-800 dark:sm:bg-transparent
					text-theme-primary-600 hover:text-theme-primary-700
					dark:text-theme-secondary-200 dark:sm:text-theme-primary-600 dark:sm:hover:text-theme-primary-700
				`}
				onClick={() => toggleVotesSelected?.(delegate.address())}
			>
				{t("COMMON.SELECT")}
			</DelegateVoteButton>
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

export const DelegateRow = ({
	index,
	voted,
	delegate,
	selectedUnvotes,
	selectedVotes,
	isVoteDisabled = false,
	isLoading = false,
	selectedWallet,
	availableBalance,
	setAvailableBalance,
	toggleUnvotesSelected,
	toggleVotesSelected,
}: DelegateRowProperties) => {
	const { t } = useTranslation();

	const { requiresStakeAmount, renderButton, isSelectedUnvote, rowColor, isSelectedVote, isActive } = useDelegateRow({
		delegate,
		index,
		isVoteDisabled,
		selectedUnvotes,
		selectedVotes,
		selectedWallet,
		toggleUnvotesSelected,
		toggleVotesSelected,
		voted,
	});

	if (isLoading) {
		return <DelegateRowSkeleton requiresStakeAmount={requiresStakeAmount} />;
	}

	return (
		<TableRow
			key={delegate.address()}
			className="relative last:!border-b-4 last:border-solid last:border-theme-secondary-200 last:dark:border-theme-secondary-800"
		>
			<TableCell
				variant="start"
				innerClassName={cn(
					"ml-3 pl-3 text-sm leading-[17px] font-semibold border-2 border-r-0 border-transparent h-9 min-h-9 my-0",
					rowColor,
				)}
			>
				<span>{delegate.rank()}</span>
			</TableCell>

			<TableCell
				innerClassName={cn(
					"font-semibold border-t-2 border-b-2 border-transparent text-sm leading-[17px] h-9 min-h-9 my-0 space-x-3",
					rowColor,
				)}
			>
				<Address
					truncateOnTable
					address={delegate.address()}
					wrapperClass="justify-start"
					addressClass="leading-[17px] text-sm w-full 1text-theme-secondary-500 1dark:text-theme-secondary-700"
				/>
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
					to={delegate.explorerLink()}
					tooltip={t("COMMON.OPEN_IN_EXPLORER")}
					isExternal
					className="w-24 md:w-auto [&_svg]:text-theme-secondary-500 dark:[&_svg]:text-theme-secondary-700"
				>
					<span>{t("COMMON.VIEW")}</span>
				</Link>
			</TableCell>

			{requiresStakeAmount && (
				<DelegateVoteAmount
					voted={voted}
					selectedWallet={selectedWallet}
					isSelectedVote={isSelectedVote}
					isSelectedUnvote={isSelectedUnvote}
					selectedVotes={selectedVotes}
					selectedUnvotes={selectedUnvotes}
					delegateAddress={delegate.address()}
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
