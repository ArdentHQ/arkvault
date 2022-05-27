import { Coins } from "@payvo/sdk";
import { Contracts } from "@payvo/sdk-profiles";
import retry from "async-retry";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { connectionReducer, defaultConnectionState } from "./connection.state";
import { openTransport, closeDevices } from "@/app/contexts/Ledger/transport";
import { useEnvironmentContext } from "@/app/contexts/Environment";
import { toasts } from "@/app/services";
import { useLedgerImport } from "@/app/contexts/Ledger/hooks/import";
import { persistLedgerConnection } from "@/app/contexts/Ledger/utils/connection";

export const useLedgerConnection = () => {
	const { t } = useTranslation();

	const { env } = useEnvironmentContext();
	const [state, dispatch] = useReducer(connectionReducer, defaultConnectionState);
	const abortRetryReference = useRef<boolean>(false);

	const [deviceName, setDeviceName] = useState<string | undefined>();
	const { device, isBusy, isConnected, isWaiting, error } = state;

	const { importLedgerWallets } = useLedgerImport({ device, env });

	useEffect(() => {
		if (deviceName) {
			if (isConnected) {
				toasts.success(t("COMMON.LEDGER_CONNECTED", { device: deviceName }));
			} else {
				toasts.warning(t("COMMON.LEDGER_DISCONNECTED", { device: deviceName }));
			}
		}
	}, [isConnected, t]); // eslint-disable-line react-hooks/exhaustive-deps

	// Actively listen to WebUSB devices and emit ONE device that was either accepted before,
	// if not it will trigger the native permission UI.
	// Important: it must be called in the context of a UI click.
	const listenDevice = useCallback(async () => {
		setDeviceName(undefined);
		await resetConnectionState();

		dispatch({ type: "waiting" });

		try {
			const { descriptor, deviceModel } = await openTransport();

			setDeviceName(deviceModel?.productName);
			dispatch({ id: deviceModel?.id || "nanoS", path: descriptor, type: "add" });
		} catch (error) {
			dispatch({ message: error.message, type: "failed" });
		}
	}, []);

	const handleLedgerConnectionError = useCallback(
		async (error: { statusText?: string; message: string }, coin: Coins.Coin) => {
			try {
				await disconnect();
				await resetConnectionState();
				await coin.ledger().disconnect();
			} catch {
				//
			}

			if (error.statusText === "UNKNOWN_ERROR") {
				return dispatch({ message: t("WALLETS.MODAL_LEDGER_WALLET.GENERIC_CONNECTION_ERROR"), type: "failed" });
			}

			if (error.message === "CONNECTION_ERROR") {
				return dispatch({ message: t("WALLETS.MODAL_LEDGER_WALLET.GENERIC_CONNECTION_ERROR"), type: "failed" });
			}

			if (error.message === "VERSION_ERROR") {
				return dispatch({
					message: t("WALLETS.MODAL_LEDGER_WALLET.UPDATE_ERROR", {
						coin: coin.network().coin(),
						version: await coin.ledger().getVersion(),
					}),
					type: "failed",
				});
			}

			dispatch({ message: error.message, type: "failed" });
		},
		[dispatch, t],
	);

	const connect = useCallback(
		async (profile: Contracts.IProfile, coin: string, network: string, retryOptions?: retry.Options) => {
			const options = retryOptions || { factor: 1, randomize: false, retries: 50 };
			await resetConnectionState();

			dispatch({ type: "waiting" });
			abortRetryReference.current = false;

			const coinInstance = profile.coins().set(coin, network);

			try {
				await persistLedgerConnection({
					coin: coinInstance,
					hasRequestedAbort: () => abortRetryReference.current,
					options,
				});
				dispatch({ type: "connected" });
			} catch (connectError) {
				handleLedgerConnectionError(connectError, coinInstance);
			}
		},
		[],
	);

	const setBusy = useCallback(() => dispatch({ type: "busy" }), []);
	const setIdle = useCallback(() => dispatch({ type: "connected" }), []);

	const abortConnectionRetry = useCallback(() => (abortRetryReference.current = true), []);
	const isAwaitingConnection = useMemo(() => isWaiting && !isConnected, [isConnected, isWaiting]);
	const isAwaitingDeviceConfirmation = useMemo(() => isWaiting && isConnected, [isConnected, isWaiting]);
	const hasDeviceAvailable = useMemo(() => !!device, [device]);

	const resetConnectionState = useCallback(async () => {
		await closeDevices();
		dispatch({ type: "remove" });
	}, []);

	const disconnect = useCallback(async () => {
		await closeDevices();
		dispatch({ type: "disconnected" });
	}, []);

	return {
		abortConnectionRetry,
		connect,
		disconnect,
		dispatch,
		error,
		hasDeviceAvailable,
		importLedgerWallets,
		isAwaitingConnection,
		isAwaitingDeviceConfirmation,
		isBusy,
		isConnected,
		ledgerDevice: device,
		listenDevice,
		resetConnectionState,
		setBusy,
		setIdle,
	};
};
