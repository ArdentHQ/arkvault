import { Contracts } from "@/app/lib/profiles";
import React from "react";
import { Trans, useTranslation } from "react-i18next";

import { Alert } from "@/app/components/Alert";
import { Header } from "@/app/components/Header";
import { Image } from "@/app/components/Image";
import { Modal } from "@/app/components/Modal";
import { Spinner } from "@/app/components/Spinner";
import { LedgerModel } from "@/app/hooks";
import { Loader } from "@/app/components/Loader";

export const LedgerDeviceErrorContent = ({
	subtitle,
	connectedModel,
	supportedModel,
	noHeading,
	subject,
}: {
	supportedModel: LedgerModel;
	connectedModel: LedgerModel;
	subtitle?: string;
	noHeading?: boolean;
	subject?: "transaction" | "message";
}) => {
	const { t } = useTranslation();

	const modelNames = {
		[Contracts.WalletLedgerModel.NanoS]: t("WALLETS.MODAL_LEDGER_WALLET.LEDGER_NANO_S"),
		[Contracts.WalletLedgerModel.NanoSP]: t("WALLETS.MODAL_LEDGER_WALLET.LEDGER_NANO_S_PLUS"),
		[Contracts.WalletLedgerModel.NanoX]: t("WALLETS.MODAL_LEDGER_WALLET.LEDGER_NANO_X"),
	};

	return (
		<div className="mt-8 space-y-8" data-testid="LedgerDeviceError">
			{!noHeading && (
				<Header
					title={t("WALLETS.MODAL_LEDGER_WALLET.TITLE")}
					subtitle={
						subtitle ||
						t("WALLETS.MODAL_LEDGER_WALLET.CONNECT_DEVICE_MODEL", { model: modelNames[supportedModel] })
					}
				/>
			)}

			{subject !== "message" && (
				<Image name="ErrorTransactionLedgerBanner" domain="transaction" className="mx-auto max-w-full" />
			)}

			<Alert variant="danger">
				<Trans
					i18nKey="WALLETS.MODAL_LEDGER_WALLET.DEVICE_NOT_SUPPORTED"
					values={{ connectedModel: modelNames[connectedModel], supportedModel: modelNames[supportedModel] }}
					components={{ bold: <strong /> }}
				/>
			</Alert>

			{subject === "message" && (
				<Loader
					text={t("WALLETS.MODAL_LEDGER_WALLET.WAITING_DEVICE")}
					data-testid="LedgerWaitingDevice-loading_message"
				/>
			)}

			{subject !== "message" && (
				<div className="inline-flex w-full items-center justify-center space-x-3">
					<Spinner />
					<span
						className="text-theme-secondary-text animate-pulse font-semibold"
						data-testid="LedgerWaitingDevice-loading_message"
					>
						{t("WALLETS.MODAL_LEDGER_WALLET.WAITING_DEVICE")}
					</span>
				</div>
			)}
		</div>
	);
};

export const LedgerDeviceError = ({
	isOpen,
	subtitle,
	onClose,
	supportedModel,
	connectedModel,
}: {
	supportedModel: LedgerModel;
	connectedModel: LedgerModel;
	isOpen: boolean;
	subtitle?: string;
	onClose?: () => void;
}) => (
	<Modal title="" isOpen={isOpen} onClose={() => onClose?.()}>
		<LedgerDeviceErrorContent subtitle={subtitle} connectedModel={connectedModel} supportedModel={supportedModel} />
	</Modal>
);
