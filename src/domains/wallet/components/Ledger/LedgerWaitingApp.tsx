import React from "react";
import { useTranslation } from "react-i18next";

import { Header } from "@/app/components/Header";
import { Image } from "@/app/components/Image";
import { Modal } from "@/app/components/Modal";
import { Spinner } from "@/app/components/Spinner";

export const LedgerWaitingAppContent = ({
	coinName,
	subtitle,
	noHeading,
}: {
	coinName: string;
	subtitle?: string;
	noHeading?: boolean;
}) => {
	const { t } = useTranslation();

	return (
		<div data-testid="LedgerWaitingAppContent" className="mt-8 space-y-8">
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
					data-testid="LedgerWaitingApp-loading_message"
				>
					{t("WALLETS.MODAL_LEDGER_WALLET.OPEN_APP", { coin: coinName })}
				</span>
			</div>
		</div>
	);
};

export const LedgerWaitingApp = ({
	isOpen,
	coinName,
	subtitle,
	onClose,
}: {
	isOpen: boolean;
	coinName: string;
	subtitle?: string;
	onClose?: () => void;
}) => (
	<Modal title={""} isOpen={isOpen} onClose={() => onClose?.()}>
		<LedgerWaitingAppContent coinName={coinName} subtitle={subtitle} />
	</Modal>
);
