import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { Image } from "@/app/components/Image";
import { Header } from "@/app/components/Header";
import { Spinner } from "@/app/components/Spinner";
import { useLedgerContext } from "@/app/contexts";
import { Loader } from "@/app/components/Loader";

export const ListenLedger = ({
	onDeviceNotAvailable,
	onDeviceAvailable,
	noHeading,
	subject,
}: {
	onDeviceNotAvailable: () => void;
	onDeviceAvailable: () => void;
	noHeading?: boolean;
	subject?: "transaction" | "message";
}) => {
	const { t } = useTranslation();

	const { listenDevice, hasDeviceAvailable, error: ledgerError, resetConnectionState } = useLedgerContext();

	useEffect(() => {
		listenDevice();
	}, [listenDevice]);

	useEffect(() => {
		// Error messages that are treated as "device not available".
		// Notice that the messages here are incomplete but they are enough to
		// detect the error.
		const notAvailableErrors = [
			// If this component is loaded without user interaction (user click).
			"Failed to execute 'requestDevice' on 'HID'",
			// User clicked cancel or permission dialog was closed.
			"Access denied to use Ledger device",

			"Cannot read properties of null",
		];

		if (
			typeof ledgerError === "string" &&
			notAvailableErrors.some((errorMessage) => ledgerError.includes(errorMessage))
		) {
			// Make sure to clear errors.
			resetConnectionState();
			onDeviceNotAvailable();
		}
	}, [ledgerError]);

	useEffect(() => {
		if (hasDeviceAvailable) {
			onDeviceAvailable();
		}
	}, [hasDeviceAvailable, onDeviceAvailable]);

	return (
		<section data-testid="LedgerAuthStep" className="h-full space-y-8 overflow-hidden">
			{!noHeading && <Header title={t("WALLETS.CONNECT_LEDGER.HEADER")} />}

			{subject === "message" && (
				<Loader
					text={t("WALLETS.CONNECT_LEDGER.WAITING_DEVICE")}
					data-testid="LedgerWaitingDevice-loading_message"
				/>
			)}

			{subject !== "message" && (
				<>
					<Image name="AuthLedgerDevice" domain="wallet" className="mx-auto max-w-full" />

					<p className="text-theme-secondary-text">{t("WALLETS.CONNECT_LEDGER.DESCRIPTION")}</p>

					<div className="inline-flex w-full items-center justify-center space-x-3">
						<Spinner />

						<span
							className="text-theme-secondary-text animate-pulse font-semibold"
							data-testid="LedgerWaitingDevice-loading_message"
						>
							{t("WALLETS.CONNECT_LEDGER.WAITING_DEVICE")}
						</span>
					</div>
				</>
			)}
		</section>
	);
};
