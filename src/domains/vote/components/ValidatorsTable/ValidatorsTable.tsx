import { Contracts } from "@ardenthq/sdk-profiles";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { ValidatorFooter } from "./ValidatorFooter";
import { ValidatorRow } from "./ValidatorRow";
import { ValidatorsTableProperties, VoteValidatorProperties } from "./ValidatorsTable.contracts";
import { validatorExistsInVotes, useValidatorsTableColumns } from "./ValidatorsTable.helpers";
import { Table } from "@/app/components/Table";
import { Pagination } from "@/app/components/Pagination";
import { useBreakpoint } from "@/app/hooks";
import { ValidatorRowMobile } from "@/domains/vote/components/ValidatorsTable/ValidatorRow/ValidatorRowMobile";
import { VotesSection } from "@/domains/vote/components/VotesSection";

export const ValidatorsTable: FC<ValidatorsTableProperties> = ({
	validators,
	isLoading = false,
	maxVotes,
	unvoteValidators,
	voteValidators,
	selectedWallet,
	votes,
	resignedValidatorVotes,
	onContinue,
	subtitle,
	searchQuery,
	setSearchQuery,
	...properties
}) => {
	const { t } = useTranslation();
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedUnvotes, setSelectedUnvotes] = useState<VoteValidatorProperties[]>(unvoteValidators);
	const [selectedVotes, setSelectedVotes] = useState<VoteValidatorProperties[]>(voteValidators);
	const [isVoteDisabled, setIsVoteDisabled] = useState(false);
	const [availableBalance, setAvailableBalance] = useState(selectedWallet.balance());
	const { isXs } = useBreakpoint();

	const columns = useValidatorsTableColumns({ isLoading, network: selectedWallet.network() });

	const validatorsPerPage = useMemo(() => selectedWallet.network().delegateCount(), [selectedWallet]);
	const totalValidators = useMemo(() => validators.length, [validators.length]);
	const hasMoreValidators = useMemo(() => totalValidators > validatorsPerPage, [totalValidators]);
	const hasVotes = votes.length > 0;

	useEffect(() => {
		if (voteValidators.length === 0) {
			return;
		}

		let totalVotesAmount = 0;

		for (const validator of voteValidators) {
			totalVotesAmount += validator.amount;
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
		if (!resignedValidatorVotes?.length) {
			return;
		}

		for (const { wallet } of resignedValidatorVotes) {
			if (validatorExistsInVotes(selectedUnvotes, wallet!.address())) {
				continue;
			}

			toggleUnvotesSelected(wallet!.address());
		}
	}, [resignedValidatorVotes, selectedUnvotes]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

	const toggleUnvotesSelected = useCallback(
		(address: string, voteAmount?: number) => {
			let unvotesInstance = selectedUnvotes;
			const validatorAlreadyExists = validatorExistsInVotes(selectedUnvotes, address);

			if (validatorAlreadyExists) {
				unvotesInstance = selectedUnvotes.filter(({ validatorAddress }) => validatorAddress !== address);
			}

			if (validatorAlreadyExists && voteAmount === undefined) {
				setSelectedUnvotes(unvotesInstance);

				if (maxVotes === 1 && selectedVotes.length > 0) {
					setSelectedVotes([]);
				}

				return;
			}

			const voteValidator: VoteValidatorProperties = {
				amount: voteAmount ?? 0,
				validatorAddress: address,
			};

			const validator = votes.find(({ wallet }) => wallet?.address() === address);
			if (validator?.amount && voteAmount === undefined) {
				voteValidator.amount = validator.amount;
			}

			if (maxVotes === 1) {
				setSelectedUnvotes([voteValidator]);
			} else {
				setSelectedUnvotes([...unvotesInstance, voteValidator]);
			}
		},
		[selectedUnvotes, votes, setSelectedUnvotes, setSelectedVotes, maxVotes, selectedVotes.length],
	);

	const toggleVotesSelected = useCallback(
		(address: string, voteAmount?: number) => {
			let votesInstance = selectedVotes;
			const validatorAlreadyExists = validatorExistsInVotes(selectedVotes, address);

			if (validatorAlreadyExists) {
				votesInstance = selectedVotes.filter(({ validatorAddress }) => validatorAddress !== address);
			}

			if (validatorAlreadyExists && voteAmount === undefined) {
				setSelectedVotes(votesInstance);

				if (maxVotes === 1 && hasVotes) {
					setSelectedUnvotes([]);
				}

				return;
			}

			const voteValidator: VoteValidatorProperties = {
				amount: voteAmount ?? 0,
				validatorAddress: address,
			};

			if (maxVotes === 1) {
				setSelectedVotes([voteValidator]);

				if (hasVotes) {
					setSelectedUnvotes(
						votes.map((vote) => ({
							amount: vote.amount,
							validatorAddress: vote.wallet!.address(),
						})),
					);
				}
			} else {
				setSelectedVotes([...votesInstance, voteValidator]);
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

	const showSkeleton = useMemo(() => totalValidators === 0 && isLoading, [totalValidators, isLoading]);
	const tableData = useMemo<Contracts.IReadOnlyWallet[]>(() => {
		if (!showSkeleton) {
			return validators;
		}

		return Array.from<Contracts.IReadOnlyWallet>({ length: validatorsPerPage }).fill(
			{} as Contracts.IReadOnlyWallet,
		);
	}, [validators, showSkeleton]);

	const renderTableRow = useCallback(
		(validator: Contracts.IReadOnlyWallet, index: number) => {
			let voted: Contracts.VoteRegistryItem | undefined;

			if (hasVotes) {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				voted = votes.find(({ wallet }) => wallet?.address() === validator?.address?.());
			}

			const View = isXs ? ValidatorRowMobile : ValidatorRow;

			return (
				<View
					index={index}
					validator={validator}
					selectedUnvotes={selectedUnvotes}
					selectedVotes={selectedVotes}
					selectedWallet={selectedWallet}
					availableBalance={availableBalance}
					setAvailableBalance={setAvailableBalance}
					voted={voted}
					isVoteDisabled={isVoteDisabled}
					isLoading={showSkeleton}
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
			toggleUnvotesSelected,
			toggleVotesSelected,
			hasVotes,
			isXs,
		],
	);

	const footer = useMemo(() => {
		if (isLoading || totalValidators > 0) {
			return null;
		}

		return (
			<tr className="border-solid border-theme-secondary-200 dark:border-theme-secondary-800 md:border-b-4">
				<td colSpan={columns.length} className="pb-4 pt-[11px]">
					<div className="flex flex-col items-center justify-center">
						<h3 className="mb-2 text-base font-semibold text-theme-secondary-900 dark:text-theme-secondary-200">
							{t("COMMON.EMPTY_RESULTS.TITLE")}
						</h3>
						<p className="text-sm text-theme-secondary-700 dark:text-theme-secondary-600">
							{t("COMMON.EMPTY_RESULTS.SUBTITLE")}
						</p>
					</div>
				</td>
			</tr>
		);
	}, [t, isLoading, totalValidators]);

	return (
		<div data-testid="ValidatorsTable" className="pb-10 sm:pb-16 md:pb-24 lg:pb-24">
			{!!subtitle && subtitle}

			<VotesSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} {...properties}>
				<Table
					className="with-x-padding"
					columns={columns}
					data={tableData}
					rowsPerPage={validatorsPerPage}
					currentPage={currentPage}
					hideHeader={isXs}
					footer={footer}
				>
					{renderTableRow}
				</Table>
			</VotesSection>

			{hasMoreValidators && (
				<div className="mt-8 flex w-full justify-center px-6 md:px-10">
					<Pagination
						totalCount={totalValidators}
						itemsPerPage={validatorsPerPage}
						currentPage={currentPage}
						onSelectPage={handleSelectPage}
					/>
				</div>
			)}

			<ValidatorFooter
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
