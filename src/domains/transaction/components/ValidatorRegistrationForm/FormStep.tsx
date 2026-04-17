import { FormField, FormLabel } from "@/app/components/Form";
import { Icon } from "@/app/components/Icon";
import React, { ChangeEvent, useEffect } from "react";
import { Alert } from "@/app/components/Alert";
import { FormStepProperties } from "@/domains/transaction/components/SendRegistrationSidePanel/SendRegistration.contracts";
import { InputDefault } from "@/app/components/Input";
import { Link } from "@/app/components/Link";
import { WalletCapabilities } from "@/domains/portfolio/lib/wallet.capabilities";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { useEnvironmentContext } from "@/app/contexts";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useValidation } from "@/app/hooks";
import { SelectAddressDropdown } from "@/domains/profile/components/SelectAddressDropdown";
import { Contracts } from "@/app/lib/profiles";

export const handleSelectSender = (
	address: string,
	setValue: (name: string, value: any, options?: any) => void,
	profile: Contracts.IProfile,
	networkId: string,
) => {
	setValue("senderAddress", address, { shouldDirty: true, shouldValidate: false });

	const newSenderWallet = profile.wallets().findByAddressWithNetwork(address, networkId);
	const isFullyRestoredAndSynced = newSenderWallet?.hasBeenFullyRestored() && newSenderWallet.hasSyncedWithNetwork();

	if (!isFullyRestoredAndSynced) {
		newSenderWallet?.synchroniser().identity();
	}
};

export const FormStep: React.FC<FormStepProperties> = ({ wallet, profile }: FormStepProperties) => {
	const { t } = useTranslation();

	const { validatorRegistration } = useValidation();

	const { getValues, register, setValue, errors } = useFormContext();
	const validatorPublicKey = getValues("validatorPublicKey");

	const { activeNetwork: network } = useActiveNetwork({ profile });
	const { env } = useEnvironmentContext();

	useEffect(() => {
		register("validatorPublicKey", validatorRegistration.validatorPublicKey(profile, network));
	}, [register, validatorRegistration, profile, network.id(), env]);

	const onSelectSender = (address: any) => {
		handleSelectSender(address, setValue, profile, network.id());
	};

	return (
		<section data-testid="ValidatorRegistrationForm_form-step">
			{errors.lockedFee && <Alert className="mb-4">{errors.lockedFee.message}</Alert>}

			<FormField name="senderAddress">
				<FormLabel label={t("COMMON.SENDER")} />

				<SelectAddressDropdown
					disabled={profile.wallets().count() === 0}
					profile={profile}
					onChange={(wallet) => {
						onSelectSender(wallet?.address() ?? "");
					}}
					wallets={profile.wallets().values()}
					wallet={wallet}
					defaultNetwork={profile.activeNetwork()}
					disableAction={(wallet) => !WalletCapabilities(wallet).canSendValidatorRegistration()}
					showBalance
				/>
			</FormField>

			<div className="mt-3 space-y-4 sm:mt-4">
				<FormField name="validatorPublicKey">
					<div className="flex flex-1 flex-row justify-between">
						<FormLabel label={t("TRANSACTION.VALIDATOR_PUBLIC_KEY")} />
						<Link
							isExternal
							to="https://docs.mainsailhq.com/mainsail/deployment/becoming-a-validator"
							showExternalIcon={false}
							className="text-sm"
						>
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
