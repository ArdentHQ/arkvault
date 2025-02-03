import React, { ChangeEvent, useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FormField, FormLabel } from "@/app/components/Form";
import { InputDefault } from "@/app/components/Input";
import { useNetworks, useValidation } from "@/app/hooks";
import { FeeField } from "@/domains/transaction/components/FeeField";
import { FormStepProperties } from "@/domains/transaction/pages/SendRegistration/SendRegistration.contracts";
import { StepHeader } from "@/app/components/StepHeader";
import { ThemeIcon } from "@/app/components/Icon";
import { SelectAddress } from "@/domains/profile/components/SelectAddress";

export const FormStep: React.FC<FormStepProperties> = ({ wallet, profile }: FormStepProperties) => {
	const { t } = useTranslation();

	const { validatorRegistration } = useValidation();

	const { getValues, register, setValue } = useFormContext();
	const validatorPublicKey = getValues("validatorPublicKey");

	const [network] = useNetworks({ profile });
	const feeTransactionData = useMemo(() => ({ validatorPublicKey }), [validatorPublicKey]);

	useEffect(() => {
		if (wallet) {
			register("validatorPublicKey", validatorRegistration.validatorPublicKey(wallet));
		}
	}, [register, validatorRegistration, wallet]);

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
		<section data-testid="ValidatorRegistrationForm_form-step">
			<StepHeader
				title={t("TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.TITLE")}
				subtitle={t("TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.DESCRIPTION")}
				titleIcon={
					<ThemeIcon dimensions={[24, 24]} lightIcon="SendTransactionLight" darkIcon="SendTransactionDark" />
				}
			/>

			<FormField name="senderAddress" className="-mx-3 mt-6 sm:mx-0 sm:mt-4">
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

			<div className="mt-3 space-y-4 sm:mt-4">
				<FormField name="validatorPublicKey">
					<FormLabel label={t("TRANSACTION.VALIDATOR_PUBLIC_KEY")} />
					<InputDefault
						data-testid="Input__validator_public_key"
						defaultValue={validatorPublicKey}
						onChange={(event: ChangeEvent<HTMLInputElement>) =>
							setValue("validatorPublicKey", event.target.value, {
								shouldDirty: true,
								shouldValidate: true,
							})
						}
					/>
				</FormField>

				<FormField name="fee">
					<FormLabel label={t("TRANSACTION.TRANSACTION_FEE")} />
					<FeeField
						type="delegateRegistration"
						data={feeTransactionData}
						network={network}
						profile={profile}
					/>
				</FormField>
			</div>
		</section>
	);
};
