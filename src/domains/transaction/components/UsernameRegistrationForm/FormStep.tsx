import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useFormContext } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { generatePath, useHistory } from "react-router-dom";
import { FormField, FormLabel } from "@/app/components/Form";
import { TransactionNetwork, TransactionSender } from "@/domains/transaction/components/TransactionDetail";
import { Alert } from "@/app/components/Alert";
import { FeeField } from "@/domains/transaction/components/FeeField";
import { FormStepProperties } from "@/domains/transaction/pages/SendRegistration/SendRegistration.contracts";
import { InputDefault } from "@/app/components/Input";
import { StepHeader } from "@/app/components/StepHeader";
import { useQueryParameters, useValidation } from "@/app/hooks";
import {
	extractNetworkFromParameters,
	normalizeSearchParametersValidationError,
	useSearchParametersValidation,
} from "@/app/hooks/use-search-parameters-validation";
import { toasts } from "@/app/services";
import { ProfilePaths } from "@/router/paths";
import { SelectAddress } from "@/domains/profile/components/SelectAddress";

export const FormStep: React.FC<FormStepProperties> = ({
	wallet,
	profile,
	onSelectedWallet,
	showWalletSelector = false,
}: FormStepProperties) => {
	const history = useHistory();

	const { t } = useTranslation();

	const { usernameRegistration } = useValidation();

	const { buildSearchParametersError } = useSearchParametersValidation();

	const { getValues, register, setValue, errors } = useFormContext();

	const parameters = useQueryParameters();

	const username = getValues("username");

	const [wallets, setWallets] = useState<Contracts.IReadWriteWallet[]>([]);

	const previousUsername = wallet?.username();

	const network = useMemo(() => {
		if (wallet) {
			return wallet.network();
		}

		try {
			return extractNetworkFromParameters({ parameters, profile });
		} catch (error) {
			toasts.error(buildSearchParametersError(normalizeSearchParametersValidationError(error)));

			history.push(
				generatePath(ProfilePaths.Dashboard, {
					profileId: profile.id(),
				}),
			);
		}
	}, [wallet, parameters]);

	const handleSelectSender = (address: any) => {
		const newActiveWallet = profile.wallets().findByAddressWithNetwork(address, network!.id());
		const isFullyRestoredAndSynced =
			newActiveWallet?.hasBeenFullyRestored() && newActiveWallet.hasSyncedWithNetwork();
		if (!isFullyRestoredAndSynced) {
			newActiveWallet?.synchroniser().identity();
		}

		onSelectedWallet?.(newActiveWallet);
	};

	const feeTransactionData = useMemo(() => ({ username }), [username]);

	const userExistsController = useRef<AbortController | undefined>(undefined);

	useEffect(() => {
		/* istanbul ignore next -- @preserve */
		if (!network) {
			return;
		}

		setWallets(profile.wallets().findByCoinWithNetwork(network.coin(), network.id()));
	}, [network, profile]);

	useEffect(() => {
		/* istanbul ignore next -- @preserve */
		if (!network) {
			return;
		}

		if (!username) {
			register("username", usernameRegistration.username(network, userExistsController));

			const queryUsername = parameters.get("username");

			setValue("username", queryUsername, { shouldDirty: true, shouldValidate: true });
		}
	}, [usernameRegistration, register, network, username]);

	const hasUsernameErrors = "username" in errors;

	useEffect(() => {
		if (hasUsernameErrors) {
			userExistsController.current?.abort();
		}
	}, [hasUsernameErrors]);

	if (network === undefined) {
		return <></>;
	}

	return (
		<section data-testid="UsernameRegistrationForm__form-step">
			<StepHeader
				title={t("TRANSACTION.PAGE_USERNAME_REGISTRATION.FORM_STEP.TITLE")}
				subtitle={t("TRANSACTION.PAGE_USERNAME_REGISTRATION.FORM_STEP.DESCRIPTION")}
			/>

			{previousUsername ? (
				<Alert variant="warning" className="mt-6">
					<Trans
						i18nKey="TRANSACTION.PAGE_USERNAME_REGISTRATION.FORM_STEP.USERNAME_REGISTERED"
						values={{ username: previousUsername }}
					/>
				</Alert>
			) : (
				<Alert variant="info" className="mt-6">
					{t("TRANSACTION.PAGE_USERNAME_REGISTRATION.FORM_STEP.INFO")}
				</Alert>
			)}

			<TransactionNetwork network={network} border={false} />

			{wallet && !showWalletSelector ? (
				<TransactionSender address={wallet.address()} network={wallet.network()} borderPosition="both" />
			) : (
				<FormField name="senderAddress">
					<FormLabel label={t("TRANSACTION.SENDER")} />

					<div data-testid="sender-address">
						<SelectAddress
							wallets={wallets}
							profile={profile}
							disabled={wallets.length === 0}
							onChange={handleSelectSender}
						/>
					</div>
				</FormField>
			)}

			<div className="space-y-6 pt-6">
				<FormField name="username">
					<FormLabel label={previousUsername ? t("TRANSACTION.NEW_USERNAME") : t("TRANSACTION.USERNAME")} />
					<InputDefault
						data-testid="Input__username"
						value={username}
						defaultValue={username}
						onChange={(event: ChangeEvent<HTMLInputElement>) => {
							userExistsController.current?.abort();
							userExistsController.current = new AbortController();
							setValue("username", event.target.value, { shouldDirty: true, shouldValidate: true });
						}}
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
