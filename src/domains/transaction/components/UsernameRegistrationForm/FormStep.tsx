import { FormField, FormLabel } from "@/app/components/Form";
import React, { ChangeEvent, useEffect, useMemo } from "react";

import { Alert } from "@/app/components/Alert";
import { FeeField } from "@/domains/transaction/components/FeeField";
import { FormStepProperties } from "@/domains/transaction/pages/SendRegistration/SendRegistration.contracts";
import { InputDefault } from "@/app/components/Input";
import { StepHeader } from "@/app/components/StepHeader";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNetworks, useValidation } from "@/app/hooks";
import { SelectAddress } from "@/domains/profile/components/SelectAddress";
import { ThemeIcon } from "@/app/components/Icon";

export const FormStep: React.FC<FormStepProperties> = ({ wallet, profile }: FormStepProperties) => {
	const { t } = useTranslation();

	const { usernameRegistration } = useValidation();

	const { getValues, register, setValue } = useFormContext();
	const username = getValues("username");

	const [network] = useNetworks({ profile });
	const feeTransactionData = useMemo(() => ({ username }), [username]);

	useEffect(() => {
		if (!username) {
			register("username", usernameRegistration.username(network));
		}
	}, [usernameRegistration, register, network, username]);

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
						wallets={profile.wallets().values()}
						profile={profile}
						disabled={profile.wallets().count() === 0}
						onChange={handleSelectSender}
					/>
				</FormField>

				<FormField name="username">
					<FormLabel label={t("COMMON.USERNAME")} />
					<InputDefault
						data-testid="Input__username"
						defaultValue={username}
						onChange={(event: ChangeEvent<HTMLInputElement>) =>
							setValue("username", event.target.value, { shouldDirty: true, shouldValidate: true })
						}
					/>
				</FormField>

				<FormField name="fee">
					<FormLabel label={t("TRANSACTION.TRANSACTION_FEE")} />
					<FeeField
						type="usernameRegistration"
						data={feeTransactionData}
						network={network}
						profile={profile}
					/>
				</FormField>
			</div>
		</section>
	);
};
