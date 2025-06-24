import { FormField, FormLabel } from "@/app/components/Form";
import { Icon, ThemeIcon } from "@/app/components/Icon";
import React, { ChangeEvent, useEffect } from "react";

import { FormStepProperties } from "@/domains/transaction/pages/SendRegistration/SendRegistration.contracts";
import { InputDefault } from "@/app/components/Input";
import { Link } from "@/app/components/Link";
import { SelectAddress } from "@/domains/profile/components/SelectAddress";
import { StepHeader } from "@/app/components/StepHeader";
import { WalletCapabilities } from "@/domains/portfolio/lib/wallet.capabilities";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { useEnvironmentContext } from "@/app/contexts";
import { useFormContext } from "react-hook-form";
import { usePortfolio } from "@/domains/portfolio/hooks/use-portfolio";
import { useTranslation } from "react-i18next";
import { useValidation } from "@/app/hooks";

export const FormStep: React.FC<FormStepProperties> = ({ wallet, profile }: FormStepProperties) => {
	const { t } = useTranslation();

	const { validatorRegistration } = useValidation();

	const { getValues, register, setValue } = useFormContext();
	const validatorPublicKey = getValues("validatorPublicKey");

	const { activeNetwork: network } = useActiveNetwork({ profile });
	const { allWallets } = usePortfolio({ profile });
	const { env } = useEnvironmentContext();

	useEffect(() => {
		register("validatorPublicKey", validatorRegistration.validatorPublicKey(profile, network));
	}, [register, validatorRegistration, profile, network.id(), env]);

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
					<ThemeIcon
						dimensions={[24, 24]}
						lightIcon="SendTransactionLight"
						darkIcon="SendTransactionDark"
						dimIcon="SendTransactionDim"
					/>
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
					wallets={allWallets}
					profile={profile}
					disabled={allWallets.length === 0}
					onChange={handleSelectSender}
					disableAction={(wallet) => !WalletCapabilities(wallet).canSendValidatorRegistration()}
				/>
			</FormField>

			<div className="mt-3 space-y-4 sm:mt-4">
				<FormField name="validatorPublicKey">
					<div className="flex flex-1 flex-row justify-between">
						<FormLabel label={t("TRANSACTION.VALIDATOR_PUBLIC_KEY")} />
						{/* TODO: update as part of https://app.clickup.com/t/86dx2r53v */}
						<Link isExternal to="https://ark.dev" showExternalIcon={false} className="text-sm">
							<span className="flex flex-row items-center gap-2">
								<span>
									<span className="hidden sm:inline">
										{t("TRANSACTION.LEARN_MORE_ABOUT_BLS_KEYS")}
									</span>
									<span className="inline sm:hidden">
										{t("TRANSACTION.LEARN_MORE_ABOUT_BLS_KEYS_SHORT")}
									</span>
								</span>

								<Icon
									data-testid="Link__external"
									name="ArrowExternal"
									dimensions={[12, 12]}
									className="text-theme-secondary-500 dark:text-theme-dark-500 shrink-0 align-middle duration-200"
								/>
							</span>
						</Link>
					</div>
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
			</div>
		</section>
	);
};
