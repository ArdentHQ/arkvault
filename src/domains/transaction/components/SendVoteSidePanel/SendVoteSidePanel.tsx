import { Services } from "@/app/lib/mainsail";
import { Contracts, DTO } from "@/app/lib/profiles";
import React, { JSX, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FormStep } from "@/domains/transaction/pages/SendVote/FormStep";
import { VoteLedgerReview } from "@/domains/transaction/pages/SendVote/LedgerReview";
import { ReviewStep } from "@/domains/transaction/pages/SendVote/ReviewStep";
import { usePendingTransactions } from "@/domains/transaction/hooks/use-pending-transactions";
import { Form } from "@/app/components/Form";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { StepsProvider, useEnvironmentContext, useLedgerContext } from "@/app/contexts";
import { useActiveProfile, useActiveWalletWhenNeeded } from "@/app/hooks";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import { ErrorStep } from "@/domains/transaction/components/ErrorStep";
import { useTransactionBuilder } from "@/domains/transaction/hooks";
import { handleBroadcastError } from "@/domains/transaction/utils";
import { assertNetwork, assertProfile, assertWallet } from "@/utils/assertions";
import { useValidatorsFromURL } from "@/domains/vote/hooks/use-vote-query-parameters";
import { toasts } from "@/app/services";
import { isLedgerTransportSupported } from "@/app/contexts/Ledger/transport";
import { TransactionSuccessful } from "@/domains/transaction/components/TransactionSuccessful";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { SidePanel, SidePanelButtons } from "@/app/components/SidePanel/SidePanel";
import { Button } from "@/app/components/Button";
import { ThemeIcon } from "@/app/components/Icon";
import cn from "classnames";

enum Step {
	FormStep = 1,
	ReviewStep,
	AuthenticationStep,
	SummaryStep,
	ErrorStep,
}

const MAX_TABS = 5;

export const SendVoteSidePanel = ({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}): JSX.Element => {
	const { t } = useTranslation();

	const { persist } = useEnvironmentContext();
	const activeProfile = useActiveProfile();
	assertProfile(activeProfile);

	const { activeNetwork } = useActiveNetwork({ profile: activeProfile });
	assertNetwork(activeNetwork);

	const walletFromHook = useActiveWalletWhenNeeded(false);
	const [wallet, setWallet] = useState<Contracts.IReadWriteWallet | undefined>(walletFromHook);

	const { votes, unvotes, setUnvotes, isLoading } = useValidatorsFromURL({
		network: activeNetwork,
		profile: activeProfile,
	});

	const { addPendingTransaction } = usePendingTransactions();

	const { hasDeviceAvailable, isConnected } = useLedgerContext();

	const [activeTab, setActiveTab] = useState<Step>(Step.FormStep);

	const [transaction, setTransaction] = useState<DTO.ExtendedSignedTransactionData | undefined>(undefined);
	const [errorMessage, setErrorMessage] = useState<string | undefined>();

	const form = useForm({ mode: "onChange" });
	const { clearErrors, formState, getValues, handleSubmit, register, setValue } = form;
	const { isDirty, isSubmitting, errors } = formState;

	const abortReference = useRef(new AbortController());
	const transactionBuilder = useTransactionBuilder();

	const activeWallet = useMemo(
		() =>
			wallet
				? wallet
				: activeProfile.wallets().findByAddressWithNetwork(getValues("senderAddress"), activeNetwork.id()),
		[wallet, activeProfile, activeNetwork, getValues],
	);

	useEffect(() => {
		register("network");
		register("senderAddress");
		register("fees");
		register("inputFeeSettings");
		register("suppressWarning");

		setValue("network", activeNetwork, { shouldDirty: true, shouldValidate: true });

		if (walletFromHook) {
			setValue("senderAddress", walletFromHook.address(), { shouldDirty: true, shouldValidate: true });
		} else if (activeProfile.wallets().count() === 1) {
			setValue("senderAddress", activeProfile.wallets().first().address(), {
				shouldDirty: true,
				shouldValidate: true,
			});
		}
	}, [register, setValue, activeNetwork, activeProfile, walletFromHook]);

	useEffect(() => {
		const senderAddress: string | undefined = getValues("senderAddress");
		if (!senderAddress) {
			return;
		}

		const updateWallet = async () => {
			const senderWallet = activeProfile.wallets().findByAddressWithNetwork(senderAddress, activeNetwork.id());

			if (!senderWallet) {
				return;
			}

			const isFullyRestoredAndSynced = senderWallet.hasBeenFullyRestored() && senderWallet.hasSyncedWithNetwork();

			if (!isFullyRestoredAndSynced) {
				await senderWallet.synchroniser().votes();
			}

			form.trigger("senderAddress");
			toasts.dismiss();

			if (senderWallet.voting().current().length === 0) {
				setUnvotes([]);
			}

			if (senderWallet.voting().current().length > 0) {
				setUnvotes(senderWallet.voting().current());
			}
		};

		void updateWallet();
	}, [activeNetwork, activeProfile, form, getValues, setUnvotes]);

	const handleBack = () => {
		abortReference.current.abort();

		if (activeTab === Step.FormStep) {
			onOpenChange(false);
			return;
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
			void handleSubmit(onSubmit)();
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
					isConfirmed =
						votes.length > 0 &&
						walletVotes.some(({ wallet }) => wallet?.address() === votes[0].wallet?.address());
				}

				if (type === "unvote") {
					isConfirmed =
						unvotes.length > 0 &&
						!walletVotes.some(({ wallet }) => wallet?.address() === unvotes[0].wallet?.address());
				}

				if (type === "combined") {
					const voteConfirmed =
						votes.length > 0 &&
						walletVotes.some(({ wallet }) => wallet?.address() === votes[0].wallet?.address());
					const unvoteConfirmed =
						unvotes.length > 0 &&
						!walletVotes.some(({ wallet }) => wallet?.address() === unvotes[0].wallet?.address());
					isConfirmed = voteConfirmed && unvoteConfirmed;
				}

				if (isConfirmed) {
					clearInterval(interval);
					resolve(undefined);
				}
			}, 1000);
		});

	const onSubmit = async () => {
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
								votes: votes.map((vote) => ({ amount: vote.amount, id: vote.wallet?.address() })),
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
				} else {
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
								votes: votes.map((vote) => ({ amount: vote.amount, id: vote.wallet?.address() })),
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
							: { votes: votes.map((vote) => ({ amount: vote.amount, id: vote.wallet?.address() })) },
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
		} catch (error: any) {
			setErrorMessage(JSON.stringify({ message: error.message, type: error.name }));
			setActiveTab(Step.ErrorStep);
		}
	};

	const hideStepNavigation =
		activeTab === Step.ErrorStep || (activeTab === Step.AuthenticationStep && activeWallet?.isLedger());

	const hasErrors = Object.values(errors).length > 0;
	const isNextDisabled = isDirty ? hasErrors : true;

	const getTitle = () => {
		if (activeTab === Step.ErrorStep) {
			return t("TRANSACTION.ERROR.TITLE");
		}

		if (activeTab === Step.AuthenticationStep) {
			return t("TRANSACTION.AUTHENTICATION_STEP.TITLE");
		}

		if (activeTab === Step.ReviewStep) {
			return t("TRANSACTION.REVIEW_STEP.TITLE");
		}

		if (activeTab === Step.SummaryStep) {
			return t("TRANSACTION.SUCCESS.CREATED");
		}

		return t("TRANSACTION.TRANSACTION_TYPES.VOTE");
	};

	const getSubtitle = () => {
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
					lightIcon="CheckmarkDoubleCircle"
					darkIcon="CheckmarkDoubleCircle"
					dimIcon="CheckmarkDoubleCircle"
					dimensions={[24, 24]}
					className={cn("text-theme-success-600")}
				/>
			);
		}

		if (activeTab === Step.AuthenticationStep) {
			if (activeWallet?.isLedger()) {
				return (
					<ThemeIcon
						lightIcon="LedgerLight"
						darkIcon="LedgerDark"
						dimIcon="LedgerDim"
						dimensions={[24, 24]}
					/>
				);
			}

			return <ThemeIcon lightIcon="Mnemonic" darkIcon="Mnemonic" dimIcon="Mnemonic" dimensions={[24, 24]} />;
		}

		if (activeTab === Step.ReviewStep) {
			return (
				<ThemeIcon
					lightIcon="DocumentView"
					darkIcon="DocumentView"
					dimIcon="DocumentView"
					dimensions={[24, 24]}
				/>
			);
		}

		return <ThemeIcon lightIcon="VoteLight" darkIcon="VoteDark" dimIcon="VoteDim" dimensions={[24, 24]} />;
	};

	return (
		<SidePanel
			open={open}
			onOpenChange={onOpenChange}
			title={getTitle()}
			subtitle={getSubtitle()}
			titleIcon={getTitleIcon()}
			dataTestId="SendVoteSidePanel"
			hasSteps
			totalSteps={MAX_TABS - 1}
			activeStep={activeTab}
			onBack={handleBack}
			isLastStep={activeTab === Step.SummaryStep}
			disableOutsidePress
			disableEscapeKey={isSubmitting}
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
							disabled={isSubmitting}
						>
							{t("COMMON.SEND")}
						</Button>
					)}

					{activeTab === Step.SummaryStep && (
						<Button data-testid="SendVote__close-button" onClick={() => onOpenChange(false)}>
							{t("COMMON.CLOSE")}
						</Button>
					)}
				</SidePanelButtons>
			}
		>
			<Form context={form} onSubmit={onSubmit}>
				<Tabs activeId={activeTab}>
					<StepsProvider steps={MAX_TABS - 1} activeStep={activeTab}>
						<TabPanel tabId={Step.FormStep}>
							<FormStep
								isWalletFieldDisabled={!!wallet || isLoading}
								profile={activeProfile}
								unvotes={unvotes}
								votes={votes}
								wallet={activeWallet}
								network={activeNetwork}
								hideHeader
								onChange={({ sender }) => setWallet(sender)}
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
								/>
							)}
						</TabPanel>

						<TabPanel tabId={Step.SummaryStep}>
							{activeWallet && (
								<TransactionSuccessful
									transaction={transaction!}
									senderWallet={activeWallet}
									noHeading
								/>
							)}
						</TabPanel>

						<TabPanel tabId={Step.ErrorStep}>
							<ErrorStep
								onClose={() => onOpenChange(false)}
								isBackDisabled={isSubmitting}
								onBack={() => setActiveTab(Step.ReviewStep)}
								errorMessage={errorMessage}
								hideHeader
							/>
						</TabPanel>

						{!hideStepNavigation && (
							<div className="mt-2">
								<button className="sr-only" type="submit" onClick={(e) => e.preventDefault()} />
							</div>
						)}
					</StepsProvider>
				</Tabs>
			</Form>
		</SidePanel>
	);
};
