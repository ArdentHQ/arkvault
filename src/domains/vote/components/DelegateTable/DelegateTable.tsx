import { Contracts } from "@ardenthq/sdk-profiles";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { DelegateFooter } from "./DelegateFooter";
import { DelegateRow } from "./DelegateRow";
import { DelegateTableProperties, VoteDelegateProperties } from "./DelegateTable.contracts";
import { delegateExistsInVotes, useDelegateTableColumns } from "./DelegateTable.helpers";
import { Table } from "@/app/components/Table";
import { Pagination } from "@/app/components/Pagination";
import { EmptyResults } from "@/app/components/EmptyResults";
import { useBreakpoint } from "@/app/hooks";

export const DelegateTable: FC<DelegateTableProperties> = ({
	delegates,
	isLoading = false,
	maxVotes,
	unvoteDelegates,
	voteDelegates,
	selectedWallet,
	votes,
	resignedDelegateVotes,
	onContinue,
	isCompact: isCompactOption,
	subtitle,
	searchQuery,
}) => {
	const { t } = useTranslation();
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedUnvotes, setSelectedUnvotes] = useState<VoteDelegateProperties[]>(unvoteDelegates);
	const [selectedVotes, setSelectedVotes] = useState<VoteDelegateProperties[]>(voteDelegates);
	const [isVoteDisabled, setIsVoteDisabled] = useState(false);
	const [availableBalance, setAvailableBalance] = useState(selectedWallet.balance());
	const { isXs, isSm, isMd } = useBreakpoint();
	const isCompact = useMemo(() => isCompactOption || isXs || isSm || isMd, [isCompactOption, isXs, isSm, isMd]);

	const columns = useDelegateTableColumns({ isLoading, network: selectedWallet.network() });

	const delegatesPerPage = useMemo(() => selectedWallet.network().delegateCount(), [selectedWallet]);
	const totalDelegates = useMemo(() => delegates.length, [delegates.length]);
	const hasMoreDelegates = useMemo(() => totalDelegates > delegatesPerPage, [totalDelegates]);
	const hasVotes = votes.length > 0;

	useEffect(() => {
		if (voteDelegates.length === 0) {
			return;
		}

		let totalVotesAmount = 0;

		for (const delegate of voteDelegates) {
			totalVotesAmount += delegate.amount;
		}

		setAvailableBalance(availableBalance - totalVotesAmount);
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if ((hasVotes || maxVotes > 1) && selectedVotes.length === maxVotes) {
			setIsVoteDisabled(true);
		} else {
			setIsVoteDisabled(false);
		}
	}, [hasVotes, maxVotes, selectedVotes]);

	useEffect(() => window.scrollTo({ behavior: "smooth", top: 0 }), [currentPage]);

	useEffect(() => {
		if (!resignedDelegateVotes?.length) {
			return;
		}

		for (const { wallet } of resignedDelegateVotes) {
			if (delegateExistsInVotes(selectedUnvotes, wallet!.address())) {
				continue;
			}

			toggleUnvotesSelected(wallet!.address());
		}
	}, [resignedDelegateVotes, selectedUnvotes]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

	const toggleUnvotesSelected = useCallback(
		(address: string, voteAmount?: number) => {
			let unvotesInstance = selectedUnvotes;
			const delegateAlreadyExists = delegateExistsInVotes(selectedUnvotes, address);

			if (delegateAlreadyExists) {
				unvotesInstance = selectedUnvotes.filter(({ delegateAddress }) => delegateAddress !== address);
			}

			if (delegateAlreadyExists && voteAmount === undefined) {
				setSelectedUnvotes(unvotesInstance);

				if (maxVotes === 1 && selectedVotes.length > 0) {
					setSelectedVotes([]);
				}

				return;
			}

			const voteDelegate: VoteDelegateProperties = {
				amount: voteAmount ?? 0,
				delegateAddress: address,
			};

			const delegate = votes.find(({ wallet }) => wallet?.address() === address);
			if (delegate?.amount && voteAmount === undefined) {
				voteDelegate.amount = delegate.amount;
			}

			if (maxVotes === 1) {
				setSelectedUnvotes([voteDelegate]);
			} else {
				setSelectedUnvotes([...unvotesInstance, voteDelegate]);
			}
		},
		[selectedUnvotes, votes, setSelectedUnvotes, setSelectedVotes, maxVotes, selectedVotes.length],
	);

	const toggleVotesSelected = useCallback(
		(address: string, voteAmount?: number) => {
			let votesInstance = selectedVotes;
			const delegateAlreadyExists = delegateExistsInVotes(selectedVotes, address);

			if (delegateAlreadyExists) {
				votesInstance = selectedVotes.filter(({ delegateAddress }) => delegateAddress !== address);
			}

			if (delegateAlreadyExists && voteAmount === undefined) {
				setSelectedVotes(votesInstance);

				if (maxVotes === 1 && hasVotes) {
					setSelectedUnvotes([]);
				}

				return;
			}

			const voteDelegate: VoteDelegateProperties = {
				amount: voteAmount ?? 0,
				delegateAddress: address,
			};

			if (maxVotes === 1) {
				setSelectedVotes([voteDelegate]);

				if (hasVotes) {
					setSelectedUnvotes(
						votes.map((vote) => ({
							amount: vote.amount,
							delegateAddress: vote.wallet!.address(),
						})),
					);
				}
			} else {
				setSelectedVotes([...votesInstance, voteDelegate]);
			}
		},
		[selectedVotes, hasVotes, setSelectedUnvotes, maxVotes, votes],
	);

	const handleSelectPage = useCallback(
		(page: number) => {
			setCurrentPage(page);
		},
		[setCurrentPage],
	);

	const showSkeleton = useMemo(() => totalDelegates === 0 && isLoading, [totalDelegates, isLoading]);
	const tableData = useMemo<Contracts.IReadOnlyWallet[]>(() => {
		if (!showSkeleton) {
			return delegates;
		}

		return Array.from<Contracts.IReadOnlyWallet>({ length: delegatesPerPage }).fill(
			{} as Contracts.IReadOnlyWallet,
		);
	}, [delegates, showSkeleton]);

	const renderTableRow = useCallback(
		(delegate: Contracts.IReadOnlyWallet, index: number) => {
			let voted: Contracts.VoteRegistryItem | undefined;

			if (hasVotes) {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				voted = votes.find(({ wallet }) => wallet?.address() === delegate?.address?.());
			}

			return (
				<DelegateRow
					index={index}
					delegate={delegate}
					selectedUnvotes={selectedUnvotes}
					selectedVotes={selectedVotes}
					selectedWallet={selectedWallet}
					availableBalance={availableBalance}
					setAvailableBalance={setAvailableBalance}
					voted={voted}
					isVoteDisabled={isVoteDisabled}
					isLoading={showSkeleton}
					isCompact={isCompact}
					toggleUnvotesSelected={toggleUnvotesSelected}
					toggleVotesSelected={toggleVotesSelected}
				/>
			);
		},
		[
			votes,
			selectedUnvotes,
			selectedVotes,
			selectedWallet,
			availableBalance,
			setAvailableBalance,
			isVoteDisabled,
			showSkeleton,
			isCompact,
			toggleUnvotesSelected,
			toggleVotesSelected,
			hasVotes,
		],
	);

	if (!isLoading && totalDelegates === 0) {
		return (
			<EmptyResults
				className="mt-16"
				title={t("COMMON.EMPTY_RESULTS.TITLE")}
				subtitle={t("VOTE.VOTES_PAGE.NO_RESULTS")}
			/>
		);
	}

	return (
		<div data-testid="DelegateTable">
			{!!subtitle && subtitle}

			<Table className="with-x-padding overflow-hidden rounded-xl border-theme-secondary-300 dark:border-theme-secondary-800 md:border" columns={columns} data={tableData} rowsPerPage={delegatesPerPage} currentPage={currentPage}>
				{renderTableRow}
			</Table>

			<div className="mt-8 flex w-full justify-center">
				{hasMoreDelegates && (
					<Pagination
						totalCount={totalDelegates}
						itemsPerPage={delegatesPerPage}
						currentPage={currentPage}
						onSelectPage={handleSelectPage}
					/>
				)}
			</div>

			<DelegateFooter
				selectedWallet={selectedWallet}
				availableBalance={availableBalance}
				selectedVotes={selectedVotes}
				selectedUnvotes={selectedUnvotes}
				maxVotes={maxVotes}
				onContinue={onContinue}
			/>
		</div>
	);
};
