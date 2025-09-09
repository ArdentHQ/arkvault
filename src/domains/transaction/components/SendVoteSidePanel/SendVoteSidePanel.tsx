import { Services } from "@/app/lib/mainsail";
import { Contracts, DTO } from "@/app/lib/profiles";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { FormStep } from "@/domains/transaction/components/SendVoteSidePanel/FormStep";
import { VoteLedgerReview } from "@/domains/transaction/components/SendVoteSidePanel/LedgerReview";
import { ReviewStep } from "@/domains/transaction/components/SendVoteSidePanel/ReviewStep";
import { usePendingTransactions } from "@/domains/transaction/hooks/use-pending-transactions";
import { Form } from "@/app/components/Form";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { useEnvironmentContext, useLedgerContext } from "@/app/contexts";
import { useActiveProfile, useValidation, useActiveWalletWhenNeeded } from "@/app/hooks";
import { useKeydown } from "@/app/hooks/use-keydown";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import { ErrorStep } from "@/domains/transaction/components/ErrorStep";
import { useTransactionBuilder } from "@/domains/transaction/hooks";
import { handleBroadcastError } from "@/domains/transaction/utils";
import { assertNetwork, assertProfile, assertWallet } from "@/utils/assertions";
import { toasts } from "@/app/services";
import { isLedgerTransportSupported } from "@/app/contexts/Ledger/transport";
import { TransactionSuccessful } from "@/domains/transaction/components/TransactionSuccessful";
import { useToggleFeeFields } from "@/domains/transaction/hooks/useToggleFeeFields";
import { useProfileJobs } from "@/app/hooks/use-profile-background-jobs";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { SidePanel, SidePanelButtons } from "@/app/components/SidePanel/SidePanel";
import { Button } from "@/app/components/Button";
import { Icon, ThemeIcon } from "@/app/components/Icon";
import { useVoteFormContext } from "@/domains/vote/contexts/VoteFormContext";
import { useConfirmedTransaction } from "@/domains/transaction/components/TransactionSuccessful/hooks/useConfirmedTransaction";
import classNames from "classnames";
import { useConnectLedger } from "@/domains/transaction/hooks/use-connect-ledger";

enum Step {
	FormStep = 1,
	ReviewStep,
	AuthenticationStep,
	SummaryStep,
	ErrorStep,
}

export const SendVoteSidePanel = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
	const { env, persist } = useEnvironmentContext();
	const navigate = useNavigate();
	const { t } = useTranslation();

	const activeProfile = useActiveProfile();
	assertProfile(activeProfile);

	const { activeNetwork } = useActiveNetwork({ profile: activeProfile });
	assertNetwork(activeNetwork);

	const networks = useMemo(() => activeProfile.availableNetworks(), [env]);

	const { votes, unvotes, setUnvotes, isLoading, selectedWallet } = useVoteFormContext();

	const { addPendingTransaction } = usePendingTransactions();

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

	const { connectLedger } = useConnectLedger({
		onReady: () => void handleSubmit(submitForm)(),
		profile: activeProfile,
	});

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
		selectedWallet,
	]);

	useEffect(() => {
		if (!senderAddress && activeProfile.wallets().count() === 1) {
			setValue("senderAddress", activeProfile.wallets().first().address(), {
				shouldDirty: true,
				shouldValidate: false,
			});
			return;
		}

		setValue("senderAddress", selectedWallet?.address(), { shouldDirty: true, shouldValidate: false });
	}, [selectedWallet, activeProfile]);

	useToggleFeeFields({
		activeTab,
		form,
		wallet: selectedWallet,
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

			let unvotes: Contracts.VoteRegistryItem[] = [];
			try {
				const current = senderWallet.voting().current();

				if (current.length > 0) {
					unvotes = current;
				}
			} catch {
				// Nothing to do, we already set the unvotes to an empty array
			}

			setUnvotes(unvotes);
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

	const onMountChange = useCallback(
		(mounted: boolean) => {
			if (!mounted) {
				setActiveTab(initialStep);

				if (activeTab === Step.SummaryStep) {
					return navigate(`/profiles/${activeProfile.id()}/dashboard`);
				}

				return;
			}
		},
		[initialStep, activeTab],
	);

	const handleBack = () => {
		// Abort any existing listener
		abortReference.current.abort();

		if (activeTab === Step.FormStep || (activeTab === Step.ReviewStep && skipFormStep)) {
			if (!selectedWallet) {
				return navigate(`/profiles/${activeProfile.id()}/dashboard`);
			}

			return handleOpenChange(false);
		}

		setActiveTab(activeTab - 1);
	};

	const handleOpenChange = (open: boolean) => {
		if (!open && activeTab === Step.SummaryStep) {
			return navigate(`/profiles/${activeProfile.id()}/dashboard`);
		}

		onOpenChange(false);
	};

	const handleNext = () => {
		abortReference.current = new AbortController();

		const newIndex = activeTab + 1;

		const { network, senderAddress } = getValues();
		const senderWallet = activeProfile.wallets().findByAddressWithNetwork(senderAddress, network.id());
		assertWallet(senderWallet);

		const isLedgerTransaction = newIndex === Step.AuthenticationStep && senderWallet.isLedger();

		if (isLedgerTransaction && !isLedgerTransportSupported()) {
			setErrorMessage(t("WALLETS.MODAL_LEDGER_WALLET.COMPATIBILITY_ERROR"));
			setActiveTab(Step.ErrorStep);
			return;
		}

		setActiveTab(newIndex);

		if (isLedgerTransaction) {
			void connectLedger();
		}
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

					addPendingTransaction(transaction);

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

					addPendingTransaction(voteResult.transaction);

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

				addPendingTransaction(transaction);

				setTransaction(transaction);

				setActiveTab(Step.SummaryStep);

				await confirmSendVote(activeWallet, isUnvote ? "unvote" : "vote");
			}
		} catch (error) {
			setErrorMessage(JSON.stringify({ message: error.message, type: error.name }));
			setActiveTab(Step.ErrorStep);
		}
	};

	const hasErrors = Object.values(errors).length > 0;
	const isNextDisabled = isDirty ? hasErrors : true;

	const skipFormStep = initialStep === Step.ReviewStep;
	const stepsCount = skipFormStep ? 3 : 4;
	const activeIndex = skipFormStep ? activeTab - 1 : activeTab;

	const { isConfirmed } = useConfirmedTransaction({
		transactionId: transaction?.hash(),
		wallet: selectedWallet,
	});

	const getTitle = () => {
		if (activeTab === Step.FormStep) {
			return t("TRANSACTION.PAGE_VOTE.FORM_STEP.TITLE");
		}

		if (activeTab === Step.ReviewStep) {
			return t("TRANSACTION.REVIEW_STEP.TITLE");
		}

		if (activeTab === Step.AuthenticationStep) {
			return t("TRANSACTION.AUTHENTICATION_STEP.TITLE");
		}

		if (activeTab === Step.SummaryStep) {
			return isConfirmed ? t("TRANSACTION.SUCCESS.CREATED") : t("TRANSACTION.PENDING.TITLE");
		}

		return t("TRANSACTION.PAGE_TRANSACTION_SEND.FORM_STEP.TITLE");
	};

	const getSubtitle = () => {
		if (activeTab === Step.FormStep) {
			return t("TRANSACTION.PAGE_VOTE.FORM_STEP.DESCRIPTION");
		}

		if (activeTab === Step.ReviewStep) {
			return t("TRANSACTION.REVIEW_STEP.DESCRIPTION");
		}

		if (activeTab === Step.AuthenticationStep) {
			return t("TRANSACTION.AUTHENTICATION_STEP.DESCRIPTION_SECRET");
		}

		return;
	};

	const getTitleIcon = () => {
		if (activeTab === Step.SummaryStep) {
			return (
				<ThemeIcon
					lightIcon={isConfirmed ? "CheckmarkDoubleCircle" : "PendingTransaction"}
					darkIcon={isConfirmed ? "CheckmarkDoubleCircle" : "PendingTransaction"}
					dimIcon={isConfirmed ? "CheckmarkDoubleCircle" : "PendingTransaction"}
					dimensions={[24, 24]}
					className={classNames({
						"text-theme-primary-600": !isConfirmed,
						"text-theme-success-600": isConfirmed,
					})}
				/>
			);
		}

		if (activeTab === Step.FormStep) {
			return (
				<ThemeIcon
					dimensions={[24, 24]}
					lightIcon="SendTransactionLight"
					darkIcon="SendTransactionDark"
					dimIcon="SendTransactionDim"
				/>
			);
		}

		if (activeTab === Step.ReviewStep) {
			return (
				<ThemeIcon
					dimensions={[24, 24]}
					lightIcon="SendTransactionLight"
					darkIcon="SendTransactionDark"
					dimIcon="SendTransactionDim"
				/>
			);
		}

		if (activeTab === Step.AuthenticationStep) {
			return (
				<Icon
					name="Mnemonic"
					data-testid="icon-mnemonic"
					className="text-theme-primary-600"
					dimensions={[24, 24]}
				/>
			);
		}
	};

	const onSubmit = () => {
		void handleSubmit(submitForm)();
	};

	return (
		<SidePanel
			open={open}
			onOpenChange={handleOpenChange}
			title={getTitle()}
			subtitle={getSubtitle()}
			titleIcon={getTitleIcon()}
			dataTestId="SendVoteSidePanel"
			hasSteps
			totalSteps={stepsCount}
			activeStep={activeIndex}
			onBack={handleBack}
			isLastStep={activeTab === Step.SummaryStep}
			disableOutsidePress
			disableEscapeKey={isSubmitting}
			onMountChange={onMountChange}
			footer={
				<SidePanelButtons>
					{activeTab !== Step.SummaryStep && (
						<Button
							data-testid="SendVote__back-button"
							variant="secondary"
							onClick={handleBack}
							disabled={isSubmitting}
						>
							{t("COMMON.BACK")}
						</Button>
					)}

					{activeTab < Step.AuthenticationStep && (
						<Button
							data-testid="SendVote__continue-button"
							onClick={handleNext}
							disabled={isNextDisabled || isSubmitting}
						>
							{t("COMMON.CONTINUE")}
						</Button>
					)}

					{activeTab === Step.AuthenticationStep && (
						<Button
							data-testid="SendVote__send-button"
							onClick={() => void handleSubmit(onSubmit)()}
							disabled={isNextDisabled || isSubmitting}
						>
							{t("COMMON.SEND")}
						</Button>
					)}

					{activeTab === Step.SummaryStep && (
						<Button data-testid="SendVote__close-button" onClick={() => handleOpenChange(false)}>
							{t("COMMON.CLOSE")}
						</Button>
					)}
				</SidePanelButtons>
			}
		>
			<Form context={form} onSubmit={submitForm}>
				<Tabs activeId={activeTab}>
					<TabPanel tabId={Step.FormStep}>
						<FormStep
							isWalletFieldDisabled={!!selectedWallet || isLoading}
							profile={activeProfile}
							unvotes={unvotes}
							votes={votes}
							wallet={activeWallet}
							network={activeNetwork}
							hideHeader
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
								hideHeader
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
								ledgerIsAwaitingApp={!isConnected}
								noHeading
								onDeviceNotAvailable={() => {
									// do nothing, wait for ledger
								}}
							/>
						)}
					</TabPanel>

					<TabPanel tabId={Step.SummaryStep}>
						{activeWallet && (
							<TransactionSuccessful transaction={transaction} senderWallet={activeWallet} noHeading />
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
				</Tabs>
			</Form>
		</SidePanel>
	);
};

SendVoteSidePanel.displayName = "SendVote";
