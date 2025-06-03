import React from "react";
import { useTranslation } from "react-i18next";

import { Header } from "@/app/components/Header";
import { Image } from "@/app/components/Image";
import { Modal } from "@/app/components/Modal";
import { Spinner } from "@/app/components/Spinner";
import { Loader } from "@/app/components/Loader";
import cn from "classnames";

export const LedgerWaitingAppContent = ({
	coinName,
	subtitle,
	noHeading,
	subject,
}: {
	coinName: string;
	subtitle?: string;
	noHeading?: boolean;
	subject?: "transaction" | "message";
}) => {
	const { t } = useTranslation();

	return (
		<div
			data-testid="LedgerWaitingAppContent"
			className={cn("space-y-8", {
				"mt-8": subject !== "message",
			})}
		>
			{!noHeading && (
				<Header
					title={t("WALLETS.MODAL_LEDGER_WALLET.TITLE")}
					subtitle={subtitle || t("WALLETS.MODAL_LEDGER_WALLET.CONNECT_DEVICE")}
				/>
			)}

			{subject === "message" && (
				<Loader
					data-testid="LedgerWaitingApp-loading_message"
					text={t("WALLETS.MODAL_LEDGER_WALLET.OPEN_APP", { coin: coinName })}
				/>
			)}

			{subject !== "message" && (
				<>
					<Image name="WaitingLedgerDevice" domain="wallet" className="mx-auto max-w-full" />

					<div className="inline-flex w-full items-center justify-center space-x-3">
						<Spinner />
						<span
							className="text-theme-secondary-text animate-pulse font-semibold"
							data-testid="LedgerWaitingApp-loading_message"
						>
							{t("WALLETS.MODAL_LEDGER_WALLET.OPEN_APP", { coin: coinName })}
						</span>
					</div>
				</>
			)}
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
