import { Services } from "@/app/lib/mainsail";
import { Contracts, DTO } from "@/app/lib/profiles";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { FormStep } from "./FormStep";
import { VoteLedgerReview } from "./LedgerReview";
import { ReviewStep } from "./ReviewStep";
import { usePendingTransactions } from "@/domains/transaction/hooks/use-pending-transactions";
import { Form } from "@/app/components/Form";
import { Page, Section } from "@/app/components/Layout";
import { StepNavigation } from "@/app/components/StepNavigation";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { StepsProvider, useEnvironmentContext, useLedgerContext } from "@/app/contexts";
import { useActiveProfile, useValidation, useNetworkFromQueryParameters, useActiveWalletWhenNeeded } from "@/app/hooks";
import { useKeydown } from "@/app/hooks/use-keydown";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import { ErrorStep } from "@/domains/transaction/components/ErrorStep";
import { useTransactionBuilder } from "@/domains/transaction/hooks";
import { handleBroadcastError } from "@/domains/transaction/utils";
import { appendParameters } from "@/domains/vote/utils/url-parameters";
import { assertNetwork, assertProfile, assertWallet } from "@/utils/assertions";
import { useValidatorsFromURL } from "@/domains/vote/hooks/use-vote-query-parameters";
import { toasts } from "@/app/services";
import { isLedgerTransportSupported } from "@/app/contexts/Ledger/transport";
import { TransactionSuccessful } from "@/domains/transaction/components/TransactionSuccessful";
import { useToggleFeeFields } from "@/domains/transaction/hooks/useToggleFeeFields";
import { useProfileJobs } from "@/app/hooks/use-profile-background-jobs";

enum Step {
	FormStep = 1,
	ReviewStep,
	AuthenticationStep,
	SummaryStep,
	ErrorStep,
}

export const SendVote = () => {
	const { env, persist } = useEnvironmentContext();
	const navigate = useNavigate();
	const { t } = useTranslation();

	const activeProfile = useActiveProfile();
	assertProfile(activeProfile);

	const activeNetwork = useNetworkFromQueryParameters(activeProfile);
	assertNetwork(activeNetwork);

	const networks = useMemo(() => activeProfile.availableNetworks(), [env]);
	const wallet = useActiveWalletWhenNeeded(false);

	const { votes, unvotes, voteValidators, unvoteValidators, setUnvotes, isLoading } = useValidatorsFromURL({
		network: activeNetwork,
		profile: activeProfile,
	});

	const { addPendingTransactionFromSigned } = usePendingTransactions();

	const walletFromUrl = useActiveWalletWhenNeeded(false);
	const initialStep = useMemo(() => (walletFromUrl ? Step.ReviewStep : Step.FormStep), [walletFromUrl]);
	const [activeTab, setActiveTab] = useState<Step>(initialStep);

	const [transaction, setTransaction] = useState(undefined as unknown as DTO.ExtendedSignedTransactionData);
	const [errorMessage, setErrorMessage] = useState<string | undefined>();

	const form = useForm({ mode: "onChange" });
	const { senderAddress } = form.watch();

	const { hasDeviceAvailable, isConnected } = useLedgerContext();
	const { syncProfileWallets } = useProfileJobs(activeProfile);

	const { clearErrors, formState, getValues, handleSubmit, register, setValue, watch } = form;
	const { isDirty, isSubmitting, errors } = formState;

	const { fees } = watch();
	const { sendVote, common } = useValidation();

	const abortReference = useRef(new AbortController());
	const transactionBuilder = useTransactionBuilder();

	const activeWallet = useMemo(
		() => activeProfile.wallets().findByAddressWithNetwork(senderAddress, activeNetwork.id()),
		[senderAddress],
	);

	useEffect(() => {
		register("network", sendVote.network());
		register("senderAddress", sendVote.senderAddress({ network: activeNetwork, profile: activeProfile, votes }));
		register("fees");

		register("inputFeeSettings");

		register("suppressWarning");

		for (const network of networks) {
			if (network.id() === activeWallet?.networkId()) {
				setValue("network", network, { shouldDirty: true, shouldValidate: true });

				break;
			}
		}
	}, [
		activeWallet,
		networks,
		register,
		setValue,
		common,
		getValues,
		sendVote,
		fees,
		votes,
		activeProfile,
		activeNetwork,
		wallet,
	]);

	useEffect(() => {
		if (!senderAddress && activeProfile.wallets().count() === 1) {
			setValue("senderAddress", activeProfile.wallets().first().address(), {
				shouldDirty: true,
				shouldValidate: false,
			});
			return;
		}

		setValue("senderAddress", wallet?.address(), { shouldDirty: true, shouldValidate: false });
	}, [wallet, activeProfile]);

	useToggleFeeFields({
		activeTab,
		form,
		wallet,
	});

	useEffect(() => {
		const updateWallet = async () => {
			const senderWallet = activeProfile.wallets().findByAddressWithNetwork(senderAddress, activeNetwork.id());

			if (!senderWallet) {
				return;
			}

			const isFullyRestoredAndSynced = senderWallet.hasBeenFullyRestored() && senderWallet.hasSyncedWithNetwork();

			if (!isFullyRestoredAndSynced) {
				syncProfileWallets(true);
				await senderWallet.synchroniser().votes();
			}

			form.trigger("senderAddress");
			toasts.dismiss();

			const errors = sendVote
				.senderAddress({ network: activeNetwork, profile: activeProfile, votes })
				.validate(senderWallet.address());

			if (Object.keys(errors).length > 0) {
				toasts.warning(errors);
				return;
			}

			if (senderWallet.voting().current().length === 0) {
				setUnvotes([]);
			}

			if (senderWallet.voting().current().length > 0) {
				setUnvotes(senderWallet.voting().current());
			}
		};

		updateWallet();
	}, [senderAddress]);

	useKeydown("Enter", () => {
		const isButton = (document.activeElement as any)?.type === "button";

		if (isButton || isNextDisabled || activeTab >= Step.AuthenticationStep) {
			return;
		}

		return handleNext();
	});

	const handleBack = () => {
		// Abort any existing listener
		abortReference.current.abort();

		if (activeTab === Step.FormStep || (activeTab === Step.ReviewStep && skipFormStep)) {
			const parameters = new URLSearchParams();

			if (!wallet) {
				return navigate(`/profiles/${activeProfile.id()}/dashboard`);
			}

			appendParameters(parameters, "unvote", unvoteValidators);
			appendParameters(parameters, "vote", voteValidators);

			return navigate({
				pathname: `/profiles/${activeProfile.id()}/wallets/${wallet.id()}/votes`,
				search: `?${parameters}`,
			});
		}

		setActiveTab(activeTab - 1);
	};

	const handleNext = () => {
		abortReference.current = new AbortController();

		const newIndex = activeTab + 1;

		const { network, senderAddress } = getValues();
		const senderWallet = activeProfile.wallets().findByAddressWithNetwork(senderAddress, network.id());
		assertWallet(senderWallet);

		if (newIndex === Step.AuthenticationStep && senderWallet.isLedger()) {
			if (!isLedgerTransportSupported()) {
				setErrorMessage(t("WALLETS.MODAL_LEDGER_WALLET.COMPATIBILITY_ERROR"));
				setActiveTab(Step.ErrorStep);
				return;
			}
			void handleSubmit(submitForm)();
		}

		setActiveTab(newIndex);
	};

	const confirmSendVote = (wallet: Contracts.IReadWriteWallet, type: "unvote" | "vote" | "combined") =>
		new Promise((resolve) => {
			const interval = setInterval(async () => {
				let isConfirmed = false;

				await wallet.synchroniser().votes();
				const walletVotes = wallet.voting().current();

				if (type === "vote") {
					isConfirmed = walletVotes.some(({ wallet }) => wallet?.address() === votes[0].wallet?.address());
				}

				if (type === "unvote") {
					isConfirmed = !walletVotes.some(({ wallet }) => wallet?.address() === unvotes[0].wallet?.address());
				}

				if (type === "combined") {
					const voteConfirmed = walletVotes.some(
						({ wallet }) => wallet?.address() === votes[0].wallet?.address(),
					);

					const unvoteConfirmed = !walletVotes.some(
						({ wallet }) => wallet?.address() === unvotes[0].wallet?.address(),
					);

					isConfirmed = voteConfirmed && unvoteConfirmed;
				}

				/* istanbul ignore else -- @preserve */
				if (isConfirmed) {
					clearInterval(interval);
					resolve("");
				}
			}, 1000);
		});

	const submitForm = async () => {
		clearErrors("mnemonic");
		const {
			mnemonic,
			network,
			senderAddress,
			secondMnemonic,
			encryptionPassword,
			secret,
			secondSecret,
			gasPrice,
			gasLimit,
		} = getValues();

		const abortSignal = abortReference.current.signal;

		assertWallet(activeWallet);

		try {
			const signatory = await activeWallet.signatoryFactory().make({
				encryptionPassword,
				mnemonic,
				secondMnemonic,
				secondSecret,
				secret,
			});

			const voteTransactionInput: Services.TransactionInput = {
				gasLimit,
				gasPrice,
				signatory,
			};

			const senderWallet = activeProfile.wallets().findByAddressWithNetwork(senderAddress, network.id());

			assertWallet(senderWallet);

			if (unvotes.length > 0 && votes.length > 0) {
				if (senderWallet.network().votingMethod() === "simple") {
					const { uuid, transaction } = await transactionBuilder.build(
						"vote",
						{
							...voteTransactionInput,
							data: {
								unvotes: unvotes.map((unvote) => ({
									amount: unvote.amount,
									id: unvote.wallet?.address(),
								})),
								votes: votes.map((vote) => ({
									amount: vote.amount,
									id: vote.wallet?.address(),
								})),
							},
						},
						senderWallet,
						{ abortSignal },
					);

					const voteResponse = await activeWallet.transaction().broadcast(uuid);

					handleBroadcastError(voteResponse);

					await persist();

					addPendingTransactionFromSigned(transaction);

					setTransaction(transaction);

					setActiveTab(Step.SummaryStep);

					await confirmSendVote(activeWallet, "combined");
				}

				if (senderWallet.network().votingMethod() === "split") {
					const unvoteResult = await transactionBuilder.build(
						"vote",
						{
							...voteTransactionInput,
							data: {
								unvotes: unvotes.map((unvote) => ({
									amount: unvote.amount,
									id: unvote.wallet?.address(),
								})),
							},
						},
						senderWallet,
						{ abortSignal },
					);

					const unvoteResponse = await activeWallet.transaction().broadcast(unvoteResult.uuid);

					handleBroadcastError(unvoteResponse);

					await persist();

					await confirmSendVote(activeWallet, "unvote");

					const voteResult = await transactionBuilder.build(
						"vote",
						{
							...voteTransactionInput,
							data: {
								votes: votes.map((vote) => ({
									amount: vote.amount,
									id: vote.wallet?.address(),
								})),
							},
						},
						senderWallet,
						{ abortSignal },
					);

					const voteResponse = await activeWallet.transaction().broadcast(voteResult.uuid);

					handleBroadcastError(voteResponse);

					await persist();

					addPendingTransactionFromSigned(voteResult.transaction);

					setTransaction(voteResult.transaction);

					setActiveTab(Step.SummaryStep);

					await confirmSendVote(activeWallet, "vote");
				}
			} else {
				const isUnvote = unvotes.length > 0;
				const { uuid, transaction } = await transactionBuilder.build(
					"vote",
					{
						...voteTransactionInput,
						data: isUnvote
							? {
									unvotes: unvotes.map((unvote) => ({
										amount: unvote.amount,
										id: unvote.wallet?.address(),
									})),
								}
							: {
									votes: votes.map((vote) => ({
										amount: vote.amount,
										id: vote.wallet?.address(),
									})),
								},
					},
					senderWallet,
					{ abortSignal },
				);

				const response = await activeWallet.transaction().broadcast(uuid);

				handleBroadcastError(response);

				await persist();

				addPendingTransactionFromSigned(transaction);

				setTransaction(transaction);

				setActiveTab(Step.SummaryStep);

				await confirmSendVote(activeWallet, isUnvote ? "unvote" : "vote");
			}
		} catch (error) {
			setErrorMessage(JSON.stringify({ message: error.message, type: error.name }));
			setActiveTab(Step.ErrorStep);
		}
	};

	const hideStepNavigation =
		activeTab === Step.ErrorStep || (activeTab === Step.AuthenticationStep && activeWallet?.isLedger());

	const hasErrors = Object.values(errors).length > 0;
	const isNextDisabled = isDirty ? hasErrors : true;

	const skipFormStep = initialStep === Step.ReviewStep;
	const stepsCount = skipFormStep ? 3 : 4;
	const activeIndex = skipFormStep ? activeTab - 1 : activeTab;

	return (
		<Page pageTitle={t("TRANSACTION.TRANSACTION_TYPES.VOTE")} showBottomNavigationBar={false}>
			<Section className="flex-1">
				<StepsProvider activeStep={activeIndex} steps={stepsCount}>
					<Form className="mx-auto max-w-172" context={form} onSubmit={submitForm}>
						<Tabs activeId={activeTab}>
							<TabPanel tabId={Step.FormStep}>
								<FormStep
									isWalletFieldDisabled={!!wallet || isLoading}
									profile={activeProfile}
									unvotes={unvotes}
									votes={votes}
									wallet={activeWallet}
									network={activeNetwork}
								/>
							</TabPanel>

							<TabPanel tabId={Step.ReviewStep}>
								{activeWallet && (
									<ReviewStep
										network={activeWallet.network()}
										unvotes={unvotes}
										votes={votes}
										wallet={activeWallet}
										profile={activeProfile}
									/>
								)}
							</TabPanel>

							<TabPanel tabId={Step.AuthenticationStep}>
								{activeWallet && (
									<AuthenticationStep
										wallet={activeWallet}
										ledgerDetails={
											<VoteLedgerReview
												profile={activeProfile}
												wallet={activeWallet}
												votes={votes}
												unvotes={unvotes}
												network={activeWallet.network()}
											/>
										}
										ledgerIsAwaitingDevice={!hasDeviceAvailable}
										ledgerIsAwaitingApp={hasDeviceAvailable && !isConnected}
									/>
								)}
							</TabPanel>

							<TabPanel tabId={Step.SummaryStep}>
								{activeWallet && (
									<TransactionSuccessful transaction={transaction} senderWallet={activeWallet} />
								)}
							</TabPanel>

							<TabPanel tabId={Step.ErrorStep}>
								<ErrorStep
									onClose={() => navigate(`/profiles/${activeProfile.id()}/dashboard`)}
									isBackDisabled={isSubmitting}
									onBack={() => {
										setActiveTab(Step.ReviewStep);
									}}
									errorMessage={errorMessage}
								/>
							</TabPanel>

							{!hideStepNavigation && (
								<StepNavigation
									onBackClick={handleBack}
									onBackToWalletClick={() => navigate(`/profiles/${activeProfile.id()}/dashboard`)}
									onContinueClick={() => handleNext()}
									isLoading={isSubmitting}
									isNextDisabled={isNextDisabled}
									size={stepsCount}
									activeIndex={activeIndex}
								/>
							)}
						</Tabs>
					</Form>
				</StepsProvider>
			</Section>
		</Page>
	);
};

SendVote.displayName = "SendVote";
