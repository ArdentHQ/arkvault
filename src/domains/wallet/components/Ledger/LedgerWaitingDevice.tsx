import React, { useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";

import { Header } from "@/app/components/Header";
import { Image } from "@/app/components/Image";
import { Modal } from "@/app/components/Modal";
import { Spinner } from "@/app/components/Spinner";
import { useLedgerContext } from "@/app/contexts/Ledger/Ledger";

export const LedgerWaitingDeviceContent = ({ subtitle, noHeading }: { subtitle?: string; noHeading?: boolean }) => {
	const { t } = useTranslation();
	return (
		<div className="space-y-8">
			{!noHeading && (
				<Header
					title={t("WALLETS.MODAL_LEDGER_WALLET.TITLE")}
					subtitle={subtitle || t("WALLETS.MODAL_LEDGER_WALLET.CONNECT_DEVICE")}
				/>
			)}

			<Image name="WaitingLedgerDevice" domain="wallet" className="mx-auto max-w-full" useAccentColor={false} />

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
