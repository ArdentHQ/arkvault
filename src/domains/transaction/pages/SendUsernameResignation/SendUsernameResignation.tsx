import { DTO } from "@ardenthq/sdk-profiles";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { FormStep } from "./FormStep";
import { ReviewStep } from "./ReviewStep";
import { Form } from "@/app/components/Form";
import { Page, Section } from "@/app/components/Layout";
import { StepNavigation } from "@/app/components/StepNavigation";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { StepsProvider, useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile, useActiveWalletWhenNeeded, useValidation } from "@/app/hooks";
import { useKeydown } from "@/app/hooks/use-keydown";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import { ErrorStep } from "@/domains/transaction/components/ErrorStep";
import { handleBroadcastError } from "@/domains/transaction/utils";
import { TransactionSuccessful } from "@/domains/transaction/components/TransactionSuccessful";
import { GasLimit, MIN_GAS_PRICE } from "@/domains/transaction/components/FeeField/FeeField";
import { assertWallet } from "@/utils/assertions";
import { useActiveNetwork } from "@/app/hooks/use-active-network";

enum Step {
	FormStep = 1,
	ReviewStep,
	AuthenticationStep,
	SummaryStep,
	ErrorStep,
}

export const SendUsernameResignation = () => {
	const history = useHistory();
	const { t } = useTranslation();

	const form = useForm({ mode: "onChange" });

	const { formState, getValues, register, watch, setValue } = form;
	const { isValid, isSubmitting } = formState;

	const { senderAddress, gasLimit, gasPrice } = watch();
	const { common } = useValidation();

	const [activeTab, setActiveTab] = useState<Step>(Step.FormStep);
	const [transaction, setTransaction] = useState(undefined as unknown as DTO.ExtendedSignedTransactionData);
	const [errorMessage, setErrorMessage] = useState<string | undefined>();

	const { persist } = useEnvironmentContext();

	const activeProfile = useActiveProfile();

	const activeWalletFromUrl = useActiveWalletWhenNeeded(false);

	const {activeNetwork: network} = useActiveNetwork({profile: activeProfile});

	const [activeWallet, setActiveWallet] = useState(() => {
		if (senderAddress) {
			return activeProfile.wallets().findByAddressWithNetwork(senderAddress, network.id());
		}

		if (activeWalletFromUrl) {
			return activeWalletFromUrl;
		}
	});

	useEffect(() => {
		register("fees");

		const walletBalance = activeWallet?.balance() ?? 0;

		register("gasPrice", common.gasPrice(walletBalance, getValues, MIN_GAS_PRICE, activeWallet?.network()));
		register(
			"gasLimit",
			common.gasLimit(walletBalance, getValues, GasLimit["usernameResignation"], activeWallet?.network()),
		);

		register("senderAddress", { required: true });

		register("inputFeeSettings");

		register("suppressWarning");
	}, [activeWallet, common, getValues, register]);

	useEffect(() => {
		if (!activeWallet || activeWallet.address() === senderAddress) {
			return;
		}

		setValue("senderAddress", activeWallet.address(), { shouldDirty: true, shouldValidate: true });
	}, [activeWallet, senderAddress, setValue]);

	useKeydown("Enter", () => {
		const isButton = (document.activeElement as any)?.type === "button";

		if (isButton || !isValid || activeTab >= Step.AuthenticationStep) {
			return;
		}

		return handleNext();
	});

	const handleBack = () => {
		if (activeTab === Step.FormStep) {
			return history.push(`/profiles/${activeProfile.id()}/dashboard`);
		}

		setActiveTab(activeTab - 1);
	};

	const handleNext = () => {
		const newIndex = activeTab + 1;

		setActiveTab(newIndex);
	};

	const handleSubmit = async () => {
		assertWallet(activeWallet);

		const { mnemonic, secondMnemonic, encryptionPassword, wif, privateKey, secret, secondSecret } = getValues();

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

			const signedTransactionId = await activeWallet.transaction().signUsernameResignation({
				gasLimit,
				gasPrice,
				signatory,
			});

			const response = await activeWallet.transaction().broadcast(signedTransactionId);

			handleBroadcastError(response);

			await persist();

			setTransaction(activeWallet.transaction().transaction(signedTransactionId));

			handleNext();
		} catch (error) {
			setErrorMessage(JSON.stringify({ message: error.message, type: error.name }));
			setActiveTab(Step.ErrorStep);
		}
	};

	const hideStepNavigation = activeTab === Step.ErrorStep;

	return (
		<Page pageTitle={t("TRANSACTION.TRANSACTION_TYPES.USERNAME_RESIGNATION")}>
			<Section className="flex-1">
				<StepsProvider steps={4} activeStep={activeTab}>
					<Form className="mx-auto max-w-xl" context={form} onSubmit={handleSubmit}>
						<Tabs activeId={activeTab}>
							<TabPanel tabId={Step.FormStep}>
								<FormStep
									senderWallet={activeWallet}
									profile={activeProfile}
									onChangeWallet={setActiveWallet}
								/>
							</TabPanel>

							<TabPanel tabId={Step.ReviewStep}>
								<ReviewStep senderWallet={activeWallet!} profile={activeProfile} />
							</TabPanel>

							<TabPanel tabId={Step.AuthenticationStep}>
								<AuthenticationStep wallet={activeWallet!} />
							</TabPanel>

							<TabPanel tabId={Step.SummaryStep}>
								<TransactionSuccessful senderWallet={activeWallet!} transaction={transaction} />
							</TabPanel>

							<TabPanel tabId={Step.ErrorStep}>
								<ErrorStep
									onClose={() => history.push(`/profiles/${activeProfile.id()}/dashboard`)}
									isBackDisabled={isSubmitting || !isValid}
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
										history.push(`/profiles/${activeProfile.id()}/dashboard`)
									}
									onContinueClick={() => handleNext()}
									isLoading={isSubmitting}
									isNextDisabled={!isValid}
									size={4}
									activeIndex={activeTab}
								/>
							)}
						</Tabs>
					</Form>
				</StepsProvider>
			</Section>
		</Page>
	);
};
