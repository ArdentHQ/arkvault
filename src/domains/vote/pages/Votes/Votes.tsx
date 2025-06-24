import { Page, Section } from "@/app/components/Layout";
import React, { FC, useCallback, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useActiveProfile, useActiveWalletWhenNeeded, useProfileJobs } from "@/app/hooks";

import { AddressTable } from "@/domains/vote/components/AddressTable";
import { Alert } from "@/app/components/Alert";
import { Contracts } from "@/app/lib/profiles";
import { CreateAddressesSidePanel } from "@/domains/portfolio/components/CreateWallet/CreateAddressSidePanel";
import { ImportAddressesSidePanel } from "@/domains/portfolio/components/ImportWallet";
import { SearchableTableWrapper } from "@/app/components/SearchableTableWrapper";
import { ValidatorsTable } from "@/domains/vote/components/ValidatorsTable";
import { VotesEmpty } from "@/domains/vote/components/VotesEmpty";
import { VotesHeader } from "@/domains/vote/components/VotesHeader";
import { assertWallet } from "@/utils/assertions";
import { getErroredNetworks } from "@/utils/profile-utils";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { useEnvironmentContext } from "@/app/contexts";
import { useValidators } from "@/domains/vote/hooks/use-validators";
import { useVoteActions } from "@/domains/vote/hooks/use-vote-actions";
import { useVoteFilters } from "@/domains/vote/hooks/use-vote-filters";
import { useVoteQueryParameters } from "@/domains/vote/hooks/use-vote-query-parameters";
import { ResetWhenUnmounted } from "@/app/components/SidePanel/ResetWhenUnmounted";

export const Votes: FC = () => {
	const { t } = useTranslation();

	const [showCreateAddressPanel, setShowCreateAddressPanel] = useState(false);
	const [showImportAddressPanel, setShowImportAddressPanel] = useState(false);

	// @TODO: the hasWalletId alias is misleading because it indicates that it
	// is a boolean but it's just a string or undefined and you still need to
	// do an assertion or casting to ensure it has a value other than undefined
	const { env } = useEnvironmentContext();

	const activeProfile = useActiveProfile();
	const activeWallet = useActiveWalletWhenNeeded(false);
	const hasWalletId = activeWallet && activeWallet.address();

	const [selectedWallet, setSelectedWallet] = useState<Contracts.IReadWriteWallet | undefined>(activeWallet);

	const { syncProfileWallets } = useProfileJobs(activeProfile);

	const { filter, voteValidators, unvoteValidators } = useVoteQueryParameters();

	const { activeNetwork } = useActiveNetwork({ profile: activeProfile });

	const {
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
	}, [fetchVotes, selectedAddress, activeNetwork.id()]);

	useEffect(() => {
		if (hasWalletId) {
			fetchValidators(activeWallet);
		}
	}, [activeWallet, fetchValidators, hasWalletId]);

	useEffect(() => {
		if (votes.length === 0) {
			setVoteFilter("all");
		}
	}, [votes, setVoteFilter]);

	useEffect(() => {
		const syncVotes = async () => {
			if (selectedWallet) {
				await activeProfile.validators().sync(activeProfile, selectedWallet.networkId());
				await selectedWallet.synchroniser().votes();
			}
		};

		void syncVotes();
	}, [selectedWallet, env, activeProfile]);

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
			<VotesHeader isSelectValidatorStep={!!selectedAddress} />

			{!hasWallets && (
				<Section className="pt-0">
					<VotesEmpty
						onCreateWallet={() => setShowCreateAddressPanel(true)}
						onImportWallet={() => setShowImportAddressPanel(true)}
					/>
				</Section>
			)}

			{hasWallets && !isSelectValidatorStep && (
				<SearchableTableWrapper
					innerClassName="lg:pb-28 md:pb-18 sm:pb-16 pb-18"
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					searchPlaceholder={t("VOTE.VOTES_PAGE.SEARCH_WALLET_PLACEHOLDER")}
				>
					<AddressTable
						network={activeNetwork}
						wallets={filteredWallets}
						onSelect={handleSelectAddress}
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						showEmptyResults={hasEmptyResults}
					/>
				</SearchableTableWrapper>
			)}

			{isSelectValidatorStep && (
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
					setSearchQuery={setSearchQuery}
					totalCurrentVotes={currentVotes.length}
					selectedFilter={voteFilter}
					setSelectedFilter={setVoteFilter}
					selectedAddress={selectedAddress}
					subtitle={
						resignedValidatorVotes.length > 0 ? (
							<Alert className="mb-4">
								<div data-testid="Votes__resigned-vote">
									<Trans
										i18nKey="VOTE.VOTES_PAGE.RESIGNED_VOTE"
										values={{
											name: currentVotes
												.find(({ wallet }) => wallet!.isResignedValidator())
												?.wallet!.username(),
										}}
										components={{ bold: <strong /> }}
									/>
								</div>
							</Alert>
						) : undefined
					}
				/>
			)}

			<ResetWhenUnmounted>
				<CreateAddressesSidePanel open={showCreateAddressPanel} onOpenChange={setShowCreateAddressPanel} />
			</ResetWhenUnmounted>
			<ResetWhenUnmounted>
				<ImportAddressesSidePanel open={showImportAddressPanel} onOpenChange={setShowImportAddressPanel} />
			</ResetWhenUnmounted>
		</Page>
	);
};
