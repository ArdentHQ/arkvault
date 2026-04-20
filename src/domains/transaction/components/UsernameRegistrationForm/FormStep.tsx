import { FormField, FormLabel } from "@/app/components/Form";
import React, { ChangeEvent, useEffect, useMemo, useRef } from "react";

import { Alert } from "@/app/components/Alert";
import { FormStepProperties } from "@/domains/transaction/components/SendRegistrationSidePanel/SendRegistration.contracts";
import { InputDefault } from "@/app/components/Input";
import { useFormContext } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { useValidation } from "@/app/hooks";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { WalletCapabilities } from "@/domains/portfolio/lib/wallet.capabilities";
import { useEnvironmentContext } from "@/app/contexts";
import { SelectAddressDropdown } from "@/domains/profile/components/SelectAddressDropdown";
import { Contracts } from "@/app/lib/profiles";

export const getWalletAddress = (wallet: { address: () => string } | null | undefined): string =>
	wallet?.address() ?? "";

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

	const { usernameRegistration } = useValidation();
	const { getValues, register, setValue, errors } = useFormContext();
	const username = getValues("username");
	const senderAddress = getValues("senderAddress");

	const userExistsController = useRef<AbortController | undefined>(undefined);
	const { activeNetwork: network } = useActiveNetwork({ profile });
	const { env } = useEnvironmentContext();

	useEffect(() => {
		register("username", usernameRegistration.username(profile, userExistsController));
	}, [usernameRegistration, register, env, network.id(), profile]);

	const hasUsernameErrors = "username" in errors;

	useEffect(() => {
		if (hasUsernameErrors) {
			userExistsController.current?.abort();
		}
	}, [hasUsernameErrors]);

	const onSelectSender = (address: any) => {
		handleSelectSender(address, setValue, profile, network.id());
	};

	const currentUsername = useMemo(() => {
		if (!senderAddress) {
			return;
		}

		const wallet = profile.wallets().findByAddressWithNetwork(senderAddress, network.id())!;

		return wallet.username();
	}, [senderAddress, network]);

	return (
		<section data-testid="UsernameRegistrationForm__form-step">
			{currentUsername ? (
				<Alert>
					<Trans
						i18nKey="TRANSACTION.PAGE_USERNAME_REGISTRATION.FORM_STEP.INFO_ALREADY_REGISTERED"
						values={{
							username: currentUsername,
						}}
						components={{ bold: <strong /> }}
					/>
				</Alert>
			) : (
				<Alert variant="info">{t("TRANSACTION.PAGE_USERNAME_REGISTRATION.FORM_STEP.INFO")}</Alert>
			)}

			<div className="mt-3 space-y-4 sm:mt-4">
				<FormField name="senderAddress">
					<FormLabel label={t("TRANSACTION.SENDER")} />

					<SelectAddressDropdown
						disabled={profile.wallets().count() === 0}
						profile={profile}
						onChange={(wallet) => {
							onSelectSender(getWalletAddress(wallet));
						}}
						wallets={profile.wallets().values()}
						wallet={wallet}
						defaultNetwork={profile.activeNetwork()}
						disableAction={(wallet) => !WalletCapabilities(wallet).canSendUsernameRegistration()}
						showBalance
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
