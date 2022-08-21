import { Services } from "@ardenthq/sdk";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { FormStep } from "./FormStep";
import { VoteLedgerReview } from "./LedgerReview";
import { ReviewStep } from "./ReviewStep";
import { SummaryStep } from "./SummaryStep";
import { Form } from "@/app/components/Form";
import { Page, Section } from "@/app/components/Layout";
import { StepNavigation } from "@/app/components/StepNavigation";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { StepsProvider, useEnvironmentContext, useLedgerContext } from "@/app/contexts";
import {
	useActiveProfile,
	useValidation,
	useNetworkFromQueryParameters,
	useActiveWalletWhenNeeded,
	useProfileJobs,
} from "@/app/hooks";
import { useKeydown } from "@/app/hooks/use-keydown";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import { ErrorStep } from "@/domains/transaction/components/ErrorStep";
import { FeeWarning } from "@/domains/transaction/components/FeeWarning";
import { useFeeConfirmation, useTransactionBuilder } from "@/domains/transaction/hooks";
import { handleBroadcastError } from "@/domains/transaction/utils";
import { appendParameters } from "@/domains/vote/utils/url-parameters";
import { assertNetwork, assertProfile, assertWallet } from "@/utils/assertions";
import { useDelegatesFromURL } from "@/domains/vote/hooks/use-vote-query-parameters";
import { toasts } from "@/app/services";

enum Step {
	FormStep = 1,
	ReviewStep,
	AuthenticationStep,
	SummaryStep,
	ErrorStep,
}

export const SendVote = () => {
	const { env, persist } = useEnvironmentContext();
	const history = useHistory();
	const { t } = useTranslation();

	const activeProfile = useActiveProfile();
	assertProfile(activeProfile);

	const activeNetwork = useNetworkFromQueryParameters(activeProfile);
	assertNetwork(activeNetwork);

	const networks = useMemo(() => activeProfile.availableNetworks(), [env]);
	const wallet = useActiveWalletWhenNeeded(false);

	const { votes, unvotes, voteDelegates, unvoteDelegates, setVotes, setUnvotes, isLoading } = useDelegatesFromURL({
		env,
		network: activeNetwork,
		profile: activeProfile,
	});

	const [activeWallet, setActiveWallet] = useState(wallet);
	const [walletDelegateStatus, setLoadingWalletDelegateStatus] = useState(false);

	const [activeTab, setActiveTab] = useState<Step>(Step.FormStep);

	const [transaction, setTransaction] = useState(undefined as unknown as DTO.ExtendedSignedTransactionData);
	const [errorMessage, setErrorMessage] = useState<string | undefined>();

	const form = useForm({ mode: "onChange" });
	const { senderAddress } = form.watch();

	const { hasDeviceAvailable, isConnected } = useLedgerContext();
	const { syncProfileWallets } = useProfileJobs(activeProfile);

	const { clearErrors, formState, getValues, handleSubmit, register, setValue, watch } = form;
	const { isDirty, isValid, isSubmitting, errors } = formState;

	const { fee, fees } = watch();
	const { sendVote, common } = useValidation();

	const abortReference = useRef(new AbortController());
	const transactionBuilder = useTransactionBuilder();

	useEffect(() => {
		register("network", sendVote.network());
		register("senderAddress", sendVote.senderAddress());
		register("fees");
		register("fee", common.fee(activeWallet?.balance(), activeWallet?.network(), fees));
		register("inputFeeSettings");

		setValue("senderAddress", activeWallet?.address(), { shouldDirty: true, shouldValidate: !!senderAddress });

		register("suppressWarning");

		for (const network of networks) {
			if (network.coin() === activeWallet?.coinId() && network.id() === activeWallet.networkId()) {
				setValue("network", network, { shouldDirty: true, shouldValidate: true });

				break;
			}
		}
	}, [activeWallet, networks, register, setValue, common, getValues, sendVote, fees]);

	const { dismissFeeWarning, feeWarningVariant, requireFeeConfirmation, showFeeWarning, setShowFeeWarning } =
		useFeeConfirmation(fee, fees);

	useEffect(() => {
		const updateWallet = async () => {
			const newSenderWallet = activeProfile.wallets().findByAddressWithNetwork(senderAddress, activeNetwork.id());

			if (!newSenderWallet) {
				return;
			}

			const isFullyRestoredAndSynced =
				newSenderWallet?.hasBeenFullyRestored() && newSenderWallet.hasSyncedWithNetwork();

			if (!isFullyRestoredAndSynced) {
				syncProfileWallets(true);
			}

			setLoadingWalletDelegateStatus(true);
			setVotes([]);
			setActiveWallet(newSenderWallet);
			toasts.dismiss();

			const votingDelegates = newSenderWallet.voting().current();

			const voteAddresses = votes.map((vote) => vote.wallet?.address());

			// Case 2: Wallet is already voting for this delegate
			if (votingDelegates.some((delegate) => voteAddresses.includes(delegate.wallet?.address()))) {
				setLoadingWalletDelegateStatus(false);

				form.setError("senderAddress", {
					message: t("TRANSACTION.VALIDATION.ALREADY_VOTING", {
						wallet: newSenderWallet.displayName(),
						delegate: votes[0],
					}),
					type: "required",
				});

				toasts.warning(
					t("TRANSACTION.VALIDATION.ALREADY_VOTING", {
						wallet: newSenderWallet?.displayName(),
						delegate: votes[0].wallet?.username(),
					}),
				);
				return;
			}

			// Case 1: Wallet is not voting yet -> Show vote field.
			if (votingDelegates.length === 0) {
				setUnvotes([]);
			}

			// Case 3: Wallet is voting for another delegate. Show vote & unvote fields
			if (votingDelegates.length > 0) {
				setUnvotes(votingDelegates);
			}

			console.log("clearing errorm");
			// form.clearErrors();
			setLoadingWalletDelegateStatus(false);
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

		if (activeTab === Step.FormStep) {
			const parameters = new URLSearchParams();

			appendParameters(parameters, "unvote", unvoteDelegates);

			appendParameters(parameters, "vote", voteDelegates);

			//	TODO: redirect to general votes page if wallet is not defined.
			return history.push({
				pathname: `/profiles/${activeProfile.id()}/wallets/${activeWallet?.id()}/votes`,
				search: `?${parameters}`,
			});
		}

		setActiveTab(activeTab - 1);
	};

	const handleNext = (suppressWarning?: boolean) => {
		abortReference.current = new AbortController();

		const newIndex = activeTab + 1;

		if (newIndex === Step.AuthenticationStep && requireFeeConfirmation && !suppressWarning) {
			return setShowFeeWarning(true);
		}

		const { network, senderAddress } = getValues();
		const senderWallet = activeProfile.wallets().findByAddressWithNetwork(senderAddress, network.id());
		assertWallet(senderWallet);

		// Skip authorization step
		if (newIndex === Step.AuthenticationStep && senderWallet.isMultiSignature()) {
			void handleSubmit(submitForm)();
			return;
		}

		if (newIndex === Step.AuthenticationStep && senderWallet.isLedger()) {
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

				/* istanbul ignore else */
				if (isConfirmed) {
					clearInterval(interval);
					resolve("");
				}
			}, 1000);
		});

	const submitForm = async () => {
		clearErrors("mnemonic");
		const {
			fee,
			mnemonic,
			network,
			senderAddress,
			secondMnemonic,
			encryptionPassword,
			wif,
			privateKey,
			secret,
			secondSecret,
		} = getValues();
		const abortSignal = abortReference.current?.signal;

		assertWallet(activeWallet);

		try {
			const signatory = await activeWallet.signatoryFactory().make({
				encryptionPassword,
				mnemonic,
				privateKey,
				secondMnemonic,
				secondSecret,
				secret,
				wif,
			});

			const voteTransactionInput: Services.TransactionInput = {
				fee: +fee,
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
									id: unvote.wallet?.governanceIdentifier(),
								})),
								votes: votes.map((vote) => ({
									amount: vote.amount,
									id: vote.wallet?.governanceIdentifier(),
								})),
							},
						},
						senderWallet,
						{ abortSignal },
					);

					const voteResponse = await activeWallet.transaction().broadcast(uuid);

					handleBroadcastError(voteResponse);

					await activeWallet.transaction().sync();

					await persist();

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
									id: unvote.wallet?.governanceIdentifier(),
								})),
							},
						},
						senderWallet,
						{ abortSignal },
					);

					const unvoteResponse = await activeWallet.transaction().broadcast(unvoteResult.uuid);

					handleBroadcastError(unvoteResponse);

					await activeWallet.transaction().sync();

					await persist();

					await confirmSendVote(activeWallet, "unvote");

					const voteResult = await transactionBuilder.build(
						"vote",
						{
							...voteTransactionInput,
							data: {
								votes: votes.map((vote) => ({
									amount: vote.amount,
									id: vote.wallet?.governanceIdentifier(),
								})),
							},
						},
						senderWallet,
						{ abortSignal },
					);

					const voteResponse = await activeWallet.transaction().broadcast(voteResult.uuid);

					handleBroadcastError(voteResponse);

					await activeWallet.transaction().sync();

					await persist();

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
										id: unvote.wallet?.governanceIdentifier(),
									})),
							  }
							: {
									votes: votes.map((vote) => ({
										amount: vote.amount,
										id: vote.wallet?.governanceIdentifier(),
									})),
							  },
					},
					senderWallet,
					{ abortSignal },
				);

				const response = await activeWallet.transaction().broadcast(uuid);

				handleBroadcastError(response);

				await activeWallet.transaction().sync();

				await persist();

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

	const isNextDisabled = useMemo(() => {
		if (walletDelegateStatus) {
			return true;
		}

		console.log({ errors });
		if (Object.values(errors).length > 0) {
			console.log("errror");
			return true;
		}

		if (!isValid) {
			console.log("is not valid");
			return true;
		}

		return false;
	}, [errors, isValid, walletDelegateStatus]);

	console.log({ isNextDisabled });

	return (
		<Page pageTitle={t("TRANSACTION.TRANSACTION_TYPES.VOTE")}>
			<Section className="flex-1">
				<StepsProvider activeStep={activeTab} steps={4}>
					<Form className="mx-auto max-w-xl" context={form} onSubmit={submitForm}>
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
									/>
								)}
							</TabPanel>

							<TabPanel tabId={Step.AuthenticationStep}>
								{activeWallet && (
									<AuthenticationStep
										wallet={activeWallet}
										ledgerDetails={
											<VoteLedgerReview
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
									<SummaryStep
										wallet={activeWallet}
										transaction={transaction}
										unvotes={unvotes}
										votes={votes}
										network={activeWallet.network()}
									/>
								)}
							</TabPanel>

							<TabPanel tabId={Step.ErrorStep}>
								<ErrorStep
									onBack={() =>
										history.push(`/profiles/${activeProfile.id()}/wallets/${activeWallet?.id()}`)
									}
									isRepeatDisabled={isSubmitting}
									onRepeat={handleSubmit(submitForm)}
									errorMessage={errorMessage}
								/>
							</TabPanel>

							{!hideStepNavigation && (
								<StepNavigation
									onBackClick={handleBack}
									onBackToWalletClick={() =>
										history.push(`/profiles/${activeProfile.id()}/wallets/${activeWallet?.id()}`)
									}
									onContinueClick={() => handleNext()}
									isLoading={isSubmitting}
									isNextDisabled={isNextDisabled}
									size={4}
									activeIndex={activeTab}
								/>
							)}
						</Tabs>

						<FeeWarning
							isOpen={showFeeWarning}
							variant={feeWarningVariant}
							onCancel={(suppressWarning: boolean) => dismissFeeWarning(handleBack, suppressWarning)}
							onConfirm={(suppressWarning: boolean) =>
								dismissFeeWarning(() => handleNext(true), suppressWarning)
							}
						/>
					</Form>
				</StepsProvider>
			</Section>
		</Page>
	);
};

SendVote.displayName = "SendVote";
