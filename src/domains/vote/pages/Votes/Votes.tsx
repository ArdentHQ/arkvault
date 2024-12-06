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

	const {
		filterProperties,
		isFilterChanged,
		filteredWalletsByCoin,
		hasEmptyResults,
		hasWallets,
		voteFilter,
		setVoteFilter,
		selectedAddress,
		setSelectedAddress,
		selectedNetwork,
		setSelectedNetwork,
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
		selectedNetwork,
		wallet: activeWallet!, // @TODO
	});

	useEffect(() => {
		if (selectedAddress && selectedNetwork) {
			fetchVotes(selectedAddress, selectedNetwork);
		}
	}, [fetchVotes, selectedAddress, selectedNetwork]);

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
		async (address: string, network: string) => {
			const wallet = activeProfile.wallets().findByAddressWithNetwork(address, network);

			assertWallet(wallet);

			setSearchQuery("");
			setSelectedAddress(address);
			setSelectedNetwork(network);
			setSelectedWallet(wallet);
			setMaxVotes(wallet.network().maximumVotesPerWallet());

			await fetchValidators(wallet);
		},
		[activeProfile, fetchValidators, setMaxVotes, setSearchQuery, setSelectedAddress, setSelectedNetwork],
	);

	const isSelectValidatorStep = !!selectedAddress;

	return (
		<Page pageTitle={isSelectValidatorStep ? t("VOTE.VALIDATOR_TABLE.TITLE") : t("VOTE.VOTES_PAGE.TITLE")}>
			<VotesHeader
				profile={activeProfile}
				setSearchQuery={setSearchQuery}
				selectedAddress={selectedAddress}
				isFilterChanged={isFilterChanged}
				isSelectDelegateStep={isSelectValidatorStep}
				filterProperties={filterProperties}
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
				<VotingWallets
					showEmptyResults={hasEmptyResults}
					walletsByCoin={filteredWalletsByCoin}
					onSelectAddress={handleSelectAddress}
					profile={activeProfile}
				/>
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
