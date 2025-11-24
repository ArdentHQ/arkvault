import { FormField, FormLabel } from "@/app/components/Form";
import React, { ChangeEvent, useEffect } from "react";

import { FormStepProperties } from "@/domains/transaction/components/SendRegistrationSidePanel/SendRegistration.contracts";
import { StepHeader } from "@/app/components/StepHeader";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useValidation } from "@/app/hooks";
import { SelectAddress } from "@/domains/profile/components/SelectAddress";
import { ThemeIcon } from "@/app/components/Icon";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { WalletCapabilities } from "@/domains/portfolio/lib/wallet.capabilities";
import { useEnvironmentContext } from "@/app/contexts";
import { TextArea } from "@/app/components/TextArea";

export const FormStep: React.FC<FormStepProperties> = ({ wallet, profile, hideHeader = false }: FormStepProperties) => {
	const { t } = useTranslation();

	const { contractDeployment } = useValidation();
	const { getValues, register, setValue } = useFormContext();

	const { activeNetwork: network } = useActiveNetwork({ profile });
	const { env } = useEnvironmentContext();

	const bytecode = getValues("bytecode");

	useEffect(() => {
		register("bytecode", contractDeployment.bytecode());
	}, [contractDeployment, register, env, network.id(), profile]);

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
		<section data-testid="ContractDeploymentForm__form-step">
			{!hideHeader && (
				<StepHeader
					title={t("TRANSACTION.CONTRACT_DEPLOYMENT.FORM_STEP.TITLE")}
					subtitle={t("TRANSACTION.CONTRACT_DEPLOYMENT.FORM_STEP.DESCRIPTION")}
					titleIcon={
						<ThemeIcon
							dimensions={[24, 24]}
							lightIcon="SendTransactionLight"
							darkIcon="SendTransactionDark"
							dimIcon="SendTransactionDim"
						/>
					}
				/>
			)}

			<div className="space-y-4">
				<FormField name="senderAddress">
					<FormLabel label={t("TRANSACTION.SENDER")} />
					<SelectAddress
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
						disableAction={(wallet) => !WalletCapabilities(wallet).canSendUsernameRegistration()}
					/>
				</FormField>

				<FormField name="bytecode">
					<FormLabel label={t("COMMON.BYTECODE")} />
					<TextArea
						data-testid="ContractDeployment_Bytecode"
						className="salam resize-none py-4"
						initialHeight={90}
						rows={6}
						placeholder={t("TRANSACTION.CONTRACT_DEPLOYMENT.BYTECODE_PLACEHOLDER")}
						defaultValue={bytecode}
						onChange={(event: ChangeEvent<HTMLInputElement>) => {
							setValue("bytecode", event.target.value, { shouldDirty: true, shouldValidate: true });
						}}
					/>
				</FormField>
			</div>
		</section>
	);
};
