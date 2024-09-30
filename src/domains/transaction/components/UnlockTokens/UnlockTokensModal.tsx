import { Services } from "@ardenthq/sdk";
import { DTO } from "@ardenthq/sdk-profiles";
import React, { useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { UnlockTokensAuthentication, UnlockTokensReview, UnlockTokensSelect } from "./blocks";
import { Step, UnlockTokensFormState, UnlockTokensModalProperties } from "./UnlockTokens.contracts";
import { useUnlockableBalances } from "./UnlockTokens.helpers";
import { Form } from "@/app/components/Form";
import { Modal } from "@/app/components/Modal";
import { useEnvironmentContext, useLedgerContext } from "@/app/contexts";
import { ErrorStep } from "@/domains/transaction/components/ErrorStep";
import { useTransactionBuilder } from "@/domains/transaction/hooks";
import { handleBroadcastError } from "@/domains/transaction/utils";
import { TransactionSuccessful } from "@/domains/transaction/components/TransactionSuccessful";

export const UnlockTokensModal: React.VFC<UnlockTokensModalProperties> = ({ profile, wallet, onClose }) => {
	const [step, setStep] = useState<Step>(Step.SelectStep);

	const [transaction, setTransaction] = useState<DTO.ExtendedSignedTransactionData | undefined>(undefined);
	const [errorMessage, setErrorMessage] = useState<string | undefined>();

	const { persist } = useEnvironmentContext();

	const abortReference = useRef<AbortController | undefined>();
	const transactionBuilder = useTransactionBuilder();

	const { hasDeviceAvailable, isConnected, connect } = useLedgerContext();

	const { items, loading, isFirstLoad } = useUnlockableBalances(wallet);

	const form = useForm<UnlockTokensFormState>({
		defaultValues: {
			amount: 0,
			fee: 0,
			selectedObjects: [],
		},
		mode: "onChange",
	});

	const { register, formState } = form;

	useEffect(() => {
		register("amount");
		register("fee");
		register("selectedObjects");
	}, [register]);

	const submit: SubmitHandler<UnlockTokensFormState> = async ({ selectedObjects, ...authenticationData }) => {
		try {
			const signatory = await wallet.signatoryFactory().make(authenticationData);

			const input: Services.UnlockTokenInput = {
				data: { objects: selectedObjects },
				signatory,
			};

			/* istanbul ignore next: Ledger signing of this TX type is not allowed yet for the coins we support -- @preserve */
			if (wallet.isLedger()) {
				await connect(profile, wallet.coinId(), wallet.networkId());
			}

			abortReference.current = new AbortController();

			const { uuid, transaction } = await transactionBuilder.build("unlockToken", input, wallet, {
				abortSignal: abortReference.current.signal,
			});

			const response = await wallet.transaction().broadcast(uuid);

			handleBroadcastError(response);

			await wallet.transaction().sync();
			await persist();

			setTransaction(transaction);
			setStep(Step.SummaryStep);
		} catch (error) {
			setErrorMessage(JSON.stringify({ message: error.message, type: error.name }));
			setStep(Step.ErrorStep);
		}
	};

	return (
		<Modal isOpen size="3xl" title={undefined} onClose={onClose}>
			<Form onSubmit={submit} context={form} data-testid="UnlockTokensModal">
				{step === Step.SelectStep && (
					<UnlockTokensSelect
						items={items}
						loading={loading}
						isFirstLoad={isFirstLoad}
						profile={profile}
						wallet={wallet}
						onClose={onClose}
						onUnlock={() => setStep(Step.ReviewStep)}
					/>
				)}

				{step === Step.ReviewStep && (
					<UnlockTokensReview
						wallet={wallet}
						onBack={() => setStep(Step.SelectStep)}
						onConfirm={() => setStep(Step.AuthenticationStep)}
					/>
				)}

				{step === Step.AuthenticationStep && (
					<UnlockTokensAuthentication
						ledgerIsAwaitingApp={!isConnected}
						ledgerIsAwaitingDevice={!hasDeviceAvailable}
						wallet={wallet}
						onBack={() => {
							abortReference.current?.abort();
							setStep(Step.ReviewStep);
						}}
					/>
				)}

				{step === Step.SummaryStep && !!transaction && (
					<TransactionSuccessful transaction={transaction} senderWallet={wallet} />
				)}

				{step === Step.ErrorStep && (
					<ErrorStep
						errorMessage={errorMessage}
						onBack={() => {
							setStep(Step.SelectStep);
						}}
						isBackDisabled={formState.isSubmitting}
					/>
				)}
			</Form>
		</Modal>
	);
};
