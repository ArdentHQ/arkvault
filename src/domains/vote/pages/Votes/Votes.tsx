import { Contracts } from "@ardenthq/sdk-profiles";
import React, { FC, useCallback, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";

import { Alert } from "@/app/components/Alert";
import { Page, Section } from "@/app/components/Layout";
import { useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile, useActiveWalletWhenNeeded, useProfileJobs } from "@/app/hooks";
import { ValidatorsTable } from "@/domains/vote/components/ValidatorsTable";
import { VotesEmpty } from "@/domains/vote/components/VotesEmpty";
import { VotesHeader } from "@/domains/vote/components/VotesHeader";
import { VotingWallets } from "@/domains/vote/components/VotingWallets/VotingWallets";
import { useValidators } from "@/domains/vote/hooks/use-validators";
import { useVoteActions } from "@/domains/vote/hooks/use-vote-actions";
import { useVoteFilters } from "@/domains/vote/hooks/use-vote-filters";
import { useVoteQueryParameters } from "@/domains/vote/hooks/use-vote-query-parameters";
import { assertWallet } from "@/utils/assertions";
import { getErroredNetworks } from "@/utils/profile-utils";
import { Input } from "@/app/components/Input";
import { Icon } from "@/app/components/Icon";
import { useActiveNetwork } from "@/app/hooks/use-active-network";

export const Votes: FC = () => {
	const history = useHistory();
	const { t } = useTranslation();

	// @TODO: the hasWalletId alias is misleading because it indicates that it
	// is a boolean but it's just a string or undefined and you still need to
	// do an assertion or casting to ensure it has a value other than undefined
	const { walletId: hasWalletId } = useParams<{ walletId: string }>();
	const { env } = useEnvironmentContext();

	const activeProfile = useActiveProfile();
	const activeWallet = useActiveWalletWhenNeeded(!!hasWalletId);
	const [selectedWallet, setSelectedWallet] = useState<Contracts.IReadWriteWallet | undefined>(activeWallet);

	const { syncProfileWallets } = useProfileJobs(activeProfile);

	const { filter, voteValidators, unvoteValidators } = useVoteQueryParameters();

	const { activeNetwork } = useActiveNetwork({ profile: activeProfile });

	const {
		isFilterChanged,
		filteredWallets,
		hasEmptyResults,
		hasWallets,
		voteFilter,
		setVoteFilter,
		selectedAddress,
		setSelectedAddress,
		searchQuery,
		setSearchQuery,
		maxVotes,
		setMaxVotes,
	} = useVoteFilters({
		filter,
		hasWalletId: !!hasWalletId,
		profile: activeProfile,
		wallet: activeWallet!, // @TODO
	});

	const {
		isLoadingValidators,
		fetchValidators,
		currentVotes,
		filteredValidators,
		fetchVotes,
		votes,
		resignedValidatorVotes,
	} = useValidators({
		env,
		profile: activeProfile,
		searchQuery,
		voteFilter,
	});

	const { navigateToSendVote } = useVoteActions({
		hasWalletId: !!hasWalletId,
		profile: activeProfile,
		selectedAddress,
		selectedNetwork: activeNetwork.id(),
		wallet: activeWallet!, // @TODO
	});

	useEffect(() => {
		if (selectedAddress) {
			fetchVotes(selectedAddress, activeNetwork.id());
		}
	}, [fetchVotes, selectedAddress, activeNetwork]);

	useEffect(() => {
		if (hasWalletId) {
			fetchValidators(activeWallet!);
		}
	}, [activeWallet, fetchValidators, hasWalletId]);

	useEffect(() => {
		if (votes.length === 0) {
			setVoteFilter("all");
		}
	}, [votes, setVoteFilter]);

	useEffect(() => {
		const { hasErroredNetworks } = getErroredNetworks(activeProfile);
		if (!hasErroredNetworks) {
			return;
		}

		syncProfileWallets(true);
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const handleSelectAddress = useCallback(
		async (address: string) => {
			const wallet = activeProfile.wallets().findByAddressWithNetwork(address, activeNetwork.id());

			assertWallet(wallet);

			setSearchQuery("");
			setSelectedAddress(address);
			// setSelectedNetwork(network);
			setSelectedWallet(wallet);
			setMaxVotes(wallet.network().maximumVotesPerWallet());

			await fetchValidators(wallet);
		},
		[activeProfile, fetchValidators, setMaxVotes, setSearchQuery, setSelectedAddress, activeNetwork],
	);

	const isSelectValidatorStep = !!selectedAddress;

	return (
		<Page pageTitle={isSelectValidatorStep ? t("VOTE.VALIDATOR_TABLE.TITLE") : t("VOTE.VOTES_PAGE.TITLE")}>
			<VotesHeader
				profile={activeProfile}
				setSearchQuery={setSearchQuery}
				selectedAddress={selectedAddress}
				isSelectDelegateStep={isSelectValidatorStep}
				totalCurrentVotes={currentVotes.length}
				selectedFilter={voteFilter}
				setSelectedFilter={setVoteFilter}
			/>

			{!hasWallets && (
				<Section>
					<VotesEmpty
						onCreateWallet={() => history.push(`/profiles/${activeProfile.id()}/wallets/create`)}
						onImportWallet={() => history.push(`/profiles/${activeProfile.id()}/wallets/import`)}
					/>
				</Section>
			)}

			{hasWallets && !isSelectValidatorStep && (
				<Section className="mt-4 py-0 pt-0 first:pt-1 md:mt-0">
					<div className="overflow-hidden rounded-xl border-theme-secondary-300 dark:border-theme-secondary-800 md:border">
						<div className="flex flex-col">
							<div className="relative flex items-center overflow-hidden rounded-xl border border-b border-theme-secondary-300 dark:border-theme-secondary-800 md:rounded-none md:border-x-0 md:border-t-0">
								<div className="pointer-events-none absolute left-0 items-center pl-6">
									<Icon name="MagnifyingGlassAlt" className="text-theme-secondary-500" />
								</div>

								<Input
									className="pl-12"
									placeholder={t("VOTE.VOTES_PAGE.SEARCH_WALLET_PLACEHOLDER")}
									value={searchQuery}
									onChange={(event) => setSearchQuery((event.target as HTMLInputElement).value)}
									noBorder
									noShadow
								/>
							</div>

							<div>
								<VotingWallets
									showEmptyResults={hasEmptyResults}
									wallets={filteredWallets}
									onSelectAddress={handleSelectAddress}
									network={activeNetwork}
									searchQuery={searchQuery}
									setSearchQuery={setSearchQuery}
								/>
							</div>
						</div>
					</div>
				</Section>
			)}

			{isSelectValidatorStep && (
				<Section innerClassName="lg:pb-28 sm:pt-2 md:pb-18 sm:pb-16 pb-18">
					<ValidatorsTable
						searchQuery={searchQuery}
						validators={filteredValidators}
						isLoading={isLoadingValidators}
						maxVotes={maxVotes!}
						votes={votes}
						resignedValidatorVotes={resignedValidatorVotes}
						unvoteValidators={unvoteValidators}
						voteValidators={voteValidators}
						selectedWallet={selectedWallet!}
						onContinue={navigateToSendVote}
						subtitle={
							resignedValidatorVotes.length > 0 ? (
								<Alert className="mb-4">
									<div data-testid="Votes__resigned-vote">
										<Trans
											i18nKey="VOTE.VOTES_PAGE.RESIGNED_VOTE"
											values={{
												name: currentVotes
													.find(({ wallet }) => wallet!.isResignedDelegate())
													?.wallet!.username(),
											}}
											components={{ bold: <strong /> }}
										/>
									</div>
								</Alert>
							) : undefined
						}
					/>
				</Section>
			)}
		</Page>
	);
};
