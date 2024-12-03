import { Services } from "@ardenthq/sdk";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { FormStep } from "./FormStep";
import { VoteLedgerReview } from "./LedgerReview";
import { ReviewStep } from "./ReviewStep";
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
import { isLedgerTransportSupported } from "@/app/contexts/Ledger/transport";
import { TransactionSuccessful } from "@/domains/transaction/components/TransactionSuccessful";

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

	const { votes, unvotes, voteDelegates, unvoteDelegates, setUnvotes, isLoading } = useDelegatesFromURL({
		env,
		network: activeNetwork,
		profile: activeProfile,
	});

	const [activeTab, setActiveTab] = useState<Step>(Step.FormStep);

	const [transaction, setTransaction] = useState(undefined as unknown as DTO.ExtendedSignedTransactionData);
	const [errorMessage, setErrorMessage] = useState<string | undefined>();

	const form = useForm({ mode: "onChange" });
	const { senderAddress } = form.watch();

	const { hasDeviceAvailable, isConnected } = useLedgerContext();
	const { syncProfileWallets } = useProfileJobs(activeProfile);

	const { clearErrors, formState, getValues, handleSubmit, register, setValue, watch } = form;
	const { isDirty, isSubmitting, errors } = formState;

	const { fee, fees } = watch();
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
		register("fee", common.fee(activeWallet?.balance(), activeWallet?.network(), fees));
		register("inputFeeSettings");

		register("suppressWarning");

		for (const network of networks) {
			if (network.coin() === activeWallet?.coinId() && network.id() === activeWallet.networkId()) {
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
		setValue("senderAddress", wallet?.address(), { shouldDirty: true, shouldValidate: false });
	}, [wallet]);

	const { dismissFeeWarning, feeWarningVariant, requireFeeConfirmation, showFeeWarning, setShowFeeWarning } =
		useFeeConfirmation(fee, fees);

	useEffect(() => {
		const updateWallet = async () => {
			const senderWallet = activeProfile.wallets().findByAddressWithNetwork(senderAddress, activeNetwork.id());

			if (!senderWallet) {
				return;
			}

			const isFullyRestoredAndSynced =
				senderWallet.hasBeenFullyRestored() && senderWallet.hasSyncedWithNetwork();

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

		if (activeTab === Step.FormStep) {
			const parameters = new URLSearchParams();

			if (!wallet) {
				return history.push(`/profiles/${activeProfile.id()}/dashboard`);
			}

			appendParameters(parameters, "unvote", unvoteDelegates);
			appendParameters(parameters, "vote", voteDelegates);

			return history.push({
				pathname: `/profiles/${activeProfile.id()}/wallets/${wallet.id()}/votes`,
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
			wif,
			privateKey,
			secret,
			secondSecret,
		} = getValues();

		const abortSignal = abortReference.current.signal;

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
				// @TODO: Remove hardcoded fee once fees are implemented for evm.
				fee: 5,
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
									id: unvote.wallet?.address()
								})),
								votes: votes.map((vote) => ({
									amount: vote.amount,
									id: vote.wallet?.address()
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
									id: unvote.wallet?.address()
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
									id: vote.wallet?.address()
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

	const hasErrors = Object.values(errors).length > 0;
	const isNextDisabled = isDirty ? hasErrors : true;

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
									<TransactionSuccessful transaction={transaction} senderWallet={activeWallet} />
								)}
							</TabPanel>

							<TabPanel tabId={Step.ErrorStep}>
								<ErrorStep
									onClose={() =>
										history.push(`/profiles/${activeProfile.id()}/wallets/${activeWallet?.id()}`)
									}
									isBackDisabled={isSubmitting}
									onBack={() => {
										setActiveTab(Step.FormStep);
									}}
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
