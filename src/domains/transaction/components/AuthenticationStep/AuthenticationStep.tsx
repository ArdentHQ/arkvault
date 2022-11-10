/* eslint-disable sonarjs/cognitive-complexity */
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
export interface LedgerStates {
	ledgerIsAwaitingDevice?: boolean;
	ledgerIsAwaitingApp?: boolean;
	ledgerSupportedModels?: LedgerModel[];
	ledgerConnectedModel?: LedgerModel;
}

type AuthenticationStepProperties = {
	wallet: Contracts.IReadWriteWallet;
	ledgerDetails?: React.ReactNode;
	subject?: "transaction" | "message";
	showHeader?: boolean;
} & LedgerStates;

const LedgerStateWrapper = ({
	ledgerConnectedModel,
	ledgerIsAwaitingApp,
	ledgerIsAwaitingDevice,
	wallet,
	children,
	ledgerSupportedModels = [Contracts.WalletLedgerModel.NanoS, Contracts.WalletLedgerModel.NanoX],
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
			<LedgerDeviceErrorContent connectedModel={ledgerConnectedModel} supportedModel={ledgerSupportedModels[0]} />
		);
	}

	if (ledgerIsAwaitingDevice) {
		return <LedgerWaitingDeviceContent subtitle={subtitle} />;
	}

	if (ledgerIsAwaitingApp) {
		return <LedgerWaitingAppContent coinName={wallet.network().coin()} subtitle={subtitle} />;
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
	showHeader,
}: AuthenticationStepProperties) => {
	const { t } = useTranslation();

	const [readyToConfirm, setReadyToConfirm] = useState(false);
	const history = useHistory();

	if (!readyToConfirm) {
		return (
			<ListenLedger
				onDeviceAvailable={() => setReadyToConfirm(true)}
				onDeviceNotAvailable={() => history.go(-1)}
			/>
		);
	}

	return (
		<div data-testid="AuthenticationStep" className="space-y-8">
			<LedgerStateWrapper
				ledgerIsAwaitingApp={ledgerIsAwaitingApp}
				ledgerIsAwaitingDevice={ledgerIsAwaitingDevice}
				ledgerSupportedModels={ledgerSupportedModels}
				ledgerConnectedModel={ledgerConnectedModel}
				wallet={wallet}
			>
				<>
					{!!showHeader && (
						<StepHeader
							title={
								subject === "transaction"
									? t("TRANSACTION.LEDGER_CONFIRMATION.TITLE")
									: t("MESSAGE.LEDGER_CONFIRMATION.TITLE")
							}
						/>
					)}

					<LedgerConfirmation noHeading={subject === "message"}>{ledgerDetails}</LedgerConfirmation>
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
	subject = "transaction",
	showHeader = true,
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
				wallet={wallet}
				subject={subject}
				showHeader={showHeader}
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
					{!!showHeader && (
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
					{!!showHeader && (
						<StepHeader title={title} subtitle={t("TRANSACTION.AUTHENTICATION_STEP.DESCRIPTION_PRIVATE_KEY")} />
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
					{!!showHeader && (
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
					{!!showHeader && (
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
					{!!showHeader && (
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
