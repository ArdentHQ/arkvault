import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { ListenLedger } from "./Ledger/ListenLedger";
import { FormField, FormLabel } from "@/app/components/Form";
import { InputPassword } from "@/app/components/Input";
import { LedgerModel, useLedgerModelStatus, useValidation } from "@/app/hooks";
import { LedgerConfirmation } from "@/domains/transaction/components/LedgerConfirmation";
import {
	LedgerDeviceErrorContent,
	LedgerWaitingAppContent,
	LedgerWaitingDeviceContent,
} from "@/domains/wallet/components/Ledger";
import { StepHeader } from "@/app/components/StepHeader";
import { Spinner } from "@/app/components/Spinner";
import { Image } from "@/app/components/Image";
import { Icon } from "@/app/components/Icon";
export interface LedgerStates {
	ledgerIsAwaitingDevice?: boolean;
	ledgerIsAwaitingApp?: boolean;
	ledgerSupportedModels?: LedgerModel[];
	ledgerConnectedModel?: LedgerModel;
	onDeviceNotAvailable?: () => void;
}

type AuthenticationStepProperties = {
	wallet: Contracts.IReadWriteWallet;
	ledgerDetails?: React.ReactNode;
	subject?: "transaction" | "message";
	noHeading?: boolean;
	requireLedgerConfirmation?: boolean;
} & LedgerStates;

const LedgerStateWrapper = ({
	ledgerConnectedModel,
	ledgerIsAwaitingApp,
	ledgerIsAwaitingDevice,
	wallet,
	children,
	ledgerSupportedModels = [Contracts.WalletLedgerModel.NanoS, Contracts.WalletLedgerModel.NanoX],
	noHeading,
}: AuthenticationStepProperties & { children: React.ReactNode }) => {
	const { t } = useTranslation();

	const { isLedgerModelSupported } = useLedgerModelStatus({
		connectedModel: ledgerConnectedModel,
		supportedModels: ledgerSupportedModels,
	});

	const subtitle = useMemo(() => {
		if (ledgerSupportedModels.length > 1 || !ledgerConnectedModel) {
			return t("WALLETS.MODAL_LEDGER_WALLET.CONNECT_DEVICE");
		}

		const modelNames = {
			[Contracts.WalletLedgerModel.NanoS]: t("WALLETS.MODAL_LEDGER_WALLET.LEDGER_NANO_S"),
			[Contracts.WalletLedgerModel.NanoX]: t("WALLETS.MODAL_LEDGER_WALLET.LEDGER_NANO_X"),
		};

		return t("WALLETS.MODAL_LEDGER_WALLET.CONNECT_DEVICE_MODEL", { model: modelNames[ledgerSupportedModels[0]] });
	}, [ledgerConnectedModel, ledgerSupportedModels, t]);

	if (ledgerConnectedModel && !isLedgerModelSupported) {
		return (
			<LedgerDeviceErrorContent
				connectedModel={ledgerConnectedModel}
				supportedModel={ledgerSupportedModels[0]}
				noHeading={noHeading}
			/>
		);
	}

	if (ledgerIsAwaitingDevice) {
		return <LedgerWaitingDeviceContent subtitle={subtitle} noHeading={noHeading} />;
	}

	if (ledgerIsAwaitingApp) {
		return <LedgerWaitingAppContent coinName={wallet.network().coin()} subtitle={subtitle} noHeading={noHeading} />;
	}

	return <>{children}</>;
};

const LedgerAuthentication = ({
	wallet,
	subject,
	ledgerDetails,
	ledgerIsAwaitingDevice,
	ledgerIsAwaitingApp,
	ledgerConnectedModel,
	ledgerSupportedModels,
	onDeviceNotAvailable,
	noHeading,
	requireLedgerConfirmation = true,
}: AuthenticationStepProperties) => {
	const { t } = useTranslation();

	const [readyToConfirm, setReadyToConfirm] = useState(false);
	const history = useHistory();

	if (!readyToConfirm) {
		return (
			<ListenLedger
				onDeviceAvailable={() => setReadyToConfirm(true)}
				onDeviceNotAvailable={onDeviceNotAvailable || (() => history.go(-1))}
				noHeading={noHeading}
			/>
		);
	}

	return (
		<div data-testid="AuthenticationStep" className="space-y-6">
			<LedgerStateWrapper
				ledgerIsAwaitingApp={ledgerIsAwaitingApp}
				ledgerIsAwaitingDevice={ledgerIsAwaitingDevice}
				ledgerSupportedModels={ledgerSupportedModels}
				ledgerConnectedModel={ledgerConnectedModel}
				wallet={wallet}
				noHeading={noHeading}
			>
				<>
					{!noHeading && (
						<StepHeader
							titleIcon={
								<Icon
									dimensions={[24, 24]}
									name="ConfirmTransaction"
									data-testid="icon-confirm"
									className="text-theme-primary-600"
								/>
							}
							title={
								subject === "transaction"
									? t("TRANSACTION.LEDGER_CONFIRMATION.TITLE")
									: t("MESSAGE.LEDGER_CONFIRMATION.TITLE")
							}
						/>
					)}

					{requireLedgerConfirmation && <LedgerConfirmation noHeading>{ledgerDetails}</LedgerConfirmation>}

					{!requireLedgerConfirmation && (
						<div className="space-y-8">
							<Image
								name="WaitingLedgerDevice"
								domain="wallet"
								className="mx-auto max-w-full"
								useAccentColor={false}
							/>

							<div className="inline-flex w-full items-center justify-center space-x-3">
								<Spinner />
								<span
									className="animate-pulse font-semibold text-theme-secondary-text"
									data-testid="LedgerWaitingDevice-loading_message"
								>
									{t("WALLETS.MODAL_LEDGER_WALLET.WAITING_DEVICE")}
								</span>
							</div>
						</div>
					)}
				</>
			</LedgerStateWrapper>
		</div>
	);
};

export const AuthenticationStep = ({
	wallet,
	ledgerDetails,
	ledgerIsAwaitingDevice,
	ledgerIsAwaitingApp,
	ledgerConnectedModel,
	ledgerSupportedModels,
	onDeviceNotAvailable,
	subject = "transaction",
	noHeading,
	requireLedgerConfirmation,
}: AuthenticationStepProperties) => {
	const { t } = useTranslation();

	const { errors, getValues, register } = useFormContext();
	const { authentication } = useValidation();

	if (wallet.isLedger()) {
		return (
			<LedgerAuthentication
				ledgerDetails={ledgerDetails}
				ledgerIsAwaitingApp={ledgerIsAwaitingApp}
				ledgerIsAwaitingDevice={ledgerIsAwaitingDevice}
				ledgerSupportedModels={ledgerSupportedModels}
				ledgerConnectedModel={ledgerConnectedModel}
				onDeviceNotAvailable={onDeviceNotAvailable}
				wallet={wallet}
				subject={subject}
				noHeading={noHeading}
				requireLedgerConfirmation={requireLedgerConfirmation}
			/>
		);
	}

	const title = t("TRANSACTION.AUTHENTICATION_STEP.TITLE");

	const requireMnemonic = wallet.actsWithMnemonic() || wallet.actsWithAddress() || wallet.actsWithPublicKey();
	const requireEncryptionPassword =
		wallet.actsWithMnemonicWithEncryption() ||
		wallet.actsWithWifWithEncryption() ||
		wallet.actsWithSecretWithEncryption();

	const isTransaction = subject === "transaction";

	const requireSecondMnemonic = isTransaction && wallet.isSecondSignature() && requireMnemonic;
	const requireSecondSecret = isTransaction && wallet.isSecondSignature() && wallet.actsWithSecret();

	return (
		<div data-testid="AuthenticationStep" className="space-y-6">
			{wallet.actsWithWif() && (
				<>
					{!noHeading && (
						<StepHeader title={title} subtitle={t("TRANSACTION.AUTHENTICATION_STEP.DESCRIPTION_WIF")} />
					)}

					<FormField name="wif">
						<FormLabel>{t("COMMON.WIF")}</FormLabel>
						<InputPassword
							data-testid="AuthenticationStep__wif"
							ref={register(authentication.wif(wallet))}
						/>
					</FormField>
				</>
			)}

			{wallet.actsWithPrivateKey() && (
				<>
					{!noHeading && (
						<StepHeader
							title={title}
							subtitle={t("TRANSACTION.AUTHENTICATION_STEP.DESCRIPTION_PRIVATE_KEY")}
						/>
					)}

					<FormField name="privateKey">
						<FormLabel>{t("COMMON.PRIVATE_KEY")}</FormLabel>
						<InputPassword
							data-testid="AuthenticationStep__private-key"
							ref={register(authentication.privateKey(wallet))}
						/>
					</FormField>
				</>
			)}

			{wallet.actsWithSecret() && (
				<>
					{!noHeading && (
						<StepHeader
							title={title}
							subtitle={
								isTransaction
									? t("TRANSACTION.AUTHENTICATION_STEP.DESCRIPTION_SECRET")
									: t("MESSAGE.PAGE_SIGN_MESSAGE.AUTHENTICATION_STEP.DESCRIPTION_SECRET")
							}
						/>
					)}

					<FormField name="secret">
						<FormLabel>{t("COMMON.SECRET")}</FormLabel>
						<InputPassword
							data-testid="AuthenticationStep__secret"
							ref={register(authentication.secret(wallet))}
						/>
					</FormField>
				</>
			)}

			{requireEncryptionPassword && (
				<>
					{!noHeading && (
						<StepHeader
							title={title}
							subtitle={
								isTransaction
									? t("TRANSACTION.AUTHENTICATION_STEP.DESCRIPTION_ENCRYPTION_PASSWORD")
									: t("MESSAGE.PAGE_SIGN_MESSAGE.AUTHENTICATION_STEP.DESCRIPTION_ENCRYPTION_PASSWORD")
							}
						/>
					)}

					<FormField name="encryptionPassword">
						<FormLabel>{t("TRANSACTION.ENCRYPTION_PASSWORD")}</FormLabel>
						<InputPassword
							data-testid="AuthenticationStep__encryption-password"
							ref={register(authentication.encryptionPassword(wallet))}
						/>
					</FormField>
				</>
			)}

			{requireMnemonic && (
				<>
					{!noHeading && (
						<StepHeader
							title={title}
							subtitle={
								isTransaction
									? t("TRANSACTION.AUTHENTICATION_STEP.DESCRIPTION_MNEMONIC")
									: t("MESSAGE.PAGE_SIGN_MESSAGE.AUTHENTICATION_STEP.DESCRIPTION_MNEMONIC")
							}
						/>
					)}

					<FormField name="mnemonic">
						<FormLabel>{t("TRANSACTION.MNEMONIC")}</FormLabel>
						<InputPassword
							data-testid="AuthenticationStep__mnemonic"
							ref={register(authentication.mnemonic(wallet))}
						/>
					</FormField>
				</>
			)}

			{requireSecondMnemonic && (
				<FormField name="secondMnemonic">
					<FormLabel>{t("TRANSACTION.SECOND_MNEMONIC")}</FormLabel>
					<InputPassword
						data-testid="AuthenticationStep__second-mnemonic"
						disabled={!getValues("mnemonic") || errors.mnemonic}
						ref={register(authentication.secondMnemonic(wallet.coin(), wallet.secondPublicKey()!))}
					/>
				</FormField>
			)}

			{requireSecondSecret && (
				<FormField name="secondSecret">
					<FormLabel>{t("TRANSACTION.SECOND_SECRET")}</FormLabel>
					<InputPassword
						data-testid="AuthenticationStep__second-secret"
						disabled={!getValues("secret") || errors.secret}
						ref={register(authentication.secondSecret(wallet.coin(), wallet.secondPublicKey()!))}
					/>
				</FormField>
			)}
		</div>
	);
};
