import React, { useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";

import { Header } from "@/app/components/Header";
import { Image } from "@/app/components/Image";
import { Modal } from "@/app/components/Modal";
import { Spinner } from "@/app/components/Spinner";
import { useLedgerContext } from "@/app/contexts/Ledger/Ledger";
import { Alert } from "@/app/components/Alert";
import { Loader } from "@/app/components/Loader";

export const LedgerWaitingDeviceContent = ({
	subtitle,
	noHeading,
	subject,
}: {
	subtitle?: string;
	noHeading?: boolean;
	subject?: "transaction" | "message";
}) => {
	const { t } = useTranslation();
	return (
		<div className="space-y-8">
			{!noHeading && (
				<Header
					title={t("WALLETS.MODAL_LEDGER_WALLET.TITLE")}
					subtitle={subtitle || t("WALLETS.MODAL_LEDGER_WALLET.CONNECT_DEVICE")}
				/>
			)}

			{subject === "message" && (
				<Loader
					data-testid="LedgerWaitingDevice-loading_message"
					text={t("WALLETS.MODAL_LEDGER_WALLET.WAITING_DEVICE")}
				/>
			)}

			{subject !== "message" && (
				<>
					<Image name="WaitingLedgerDevice" domain="wallet" className="mx-auto max-w-full" />

					<div className="inline-flex w-full items-center justify-center space-x-3">
						<Spinner />
						<span
							className="text-theme-secondary-text animate-pulse font-semibold"
							data-testid="LedgerWaitingDevice-loading_message"
						>
							{t("WALLETS.MODAL_LEDGER_WALLET.WAITING_DEVICE")}
						</span>
					</div>
				</>
			)}
		</div>
	);
};

export const LedgerWaitingDevice = ({
	isOpen,
	onClose,
	subtitle,
	onDeviceAvailable,
}: {
	isOpen: boolean;
	subtitle?: string;
	onClose?: () => void;
	onDeviceAvailable?: (hasDeviceAvailable: boolean) => void;
}) => {
	const { hasDeviceAvailable } = useLedgerContext();

	useLayoutEffect(() => {
		if (hasDeviceAvailable) {
			onDeviceAvailable?.(true);
		}
	}, [hasDeviceAvailable, onDeviceAvailable]);

	return (
		<Modal title={""} isOpen={isOpen} onClose={() => onClose?.()}>
			<LedgerWaitingDeviceContent subtitle={subtitle} />
		</Modal>
	);
};
