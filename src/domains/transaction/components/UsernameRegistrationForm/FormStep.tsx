import { FormField, FormLabel } from "@/app/components/Form";
import React, { ChangeEvent, useEffect, useRef } from "react";

import { Alert } from "@/app/components/Alert";
import { FormStepProperties } from "@/domains/transaction/pages/SendRegistration/SendRegistration.contracts";
import { InputDefault } from "@/app/components/Input";
import { StepHeader } from "@/app/components/StepHeader";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useValidation } from "@/app/hooks";
import { SelectAddress } from "@/domains/profile/components/SelectAddress";
import { ThemeIcon } from "@/app/components/Icon";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { WalletCapabilities } from "@/domains/portfolio/lib/wallet.capabilities";
import { usePortfolio } from "@/domains/portfolio/hooks/use-portfolio";

export const FormStep: React.FC<FormStepProperties> = ({ wallet, profile }: FormStepProperties) => {
	const { t } = useTranslation();

	const { usernameRegistration } = useValidation();

	const { getValues, register, setValue, errors } = useFormContext();
	const username = getValues("username");

	const userExistsController = useRef<AbortController | undefined>(undefined);
	const { activeNetwork: network } = useActiveNetwork({ profile });
	const { allWallets } = usePortfolio({ profile });

	useEffect(() => {
		if (!username) {
			register("username", usernameRegistration.username(network, userExistsController));
		}
	}, [usernameRegistration, register, network, username]);

	const hasUsernameErrors = "username" in errors;

	useEffect(() => {
		if (hasUsernameErrors) {
			userExistsController.current?.abort();
		}
	}, [hasUsernameErrors]);

	const handleSelectSender = (address: any) => {
		setValue("senderAddress", address, { shouldDirty: true, shouldValidate: false });

		const newSenderWallet = profile.wallets().findByAddressWithNetwork(address, network.id());
		const isFullyRestoredAndSynced =
			newSenderWallet?.hasBeenFullyRestored() && newSenderWallet.hasSyncedWithNetwork();

		if (!isFullyRestoredAndSynced) {
			newSenderWallet?.synchroniser().identity();
		}
	};

	return (
		<section data-testid="UsernameRegistrationForm__form-step">
			<StepHeader
				title={t("TRANSACTION.PAGE_USERNAME_REGISTRATION.FORM_STEP.TITLE")}
				subtitle={t("TRANSACTION.PAGE_USERNAME_REGISTRATION.FORM_STEP.DESCRIPTION")}
				titleIcon={
					<ThemeIcon dimensions={[24, 24]} lightIcon="SendTransactionLight" darkIcon="SendTransactionDark" />
				}
			/>

			<Alert variant="info" className="mt-6">
				{t("TRANSACTION.PAGE_USERNAME_REGISTRATION.FORM_STEP.INFO")}
			</Alert>

			<div className="mt-3 space-y-4 sm:mt-4">
				<FormField name="senderAddress">
					<SelectAddress
						showWalletAvatar={false}
						wallet={
							wallet
								? {
										address: wallet.address(),
										network: wallet.network(),
									}
								: undefined
						}
						wallets={allWallets}
						profile={profile}
						disabled={allWallets.length === 0}
						onChange={handleSelectSender}
						disableAction={(wallet) => !WalletCapabilities(wallet).canSendUsernameRegistration()}
					/>
				</FormField>

				<FormField name="username">
					<FormLabel label={t("COMMON.USERNAME")} />
					<InputDefault
						data-testid="Input__username"
						defaultValue={username}
						onChange={(event: ChangeEvent<HTMLInputElement>) => {
							userExistsController.current?.abort();
							userExistsController.current = new AbortController();
							setValue("username", event.target.value, { shouldDirty: true, shouldValidate: true });
						}}
					/>
				</FormField>
			</div>
		</section>
	);
};
