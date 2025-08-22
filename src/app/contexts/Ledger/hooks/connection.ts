import { Contracts } from "@/app/lib/profiles";
import { Options } from "p-retry";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { connectionReducer, defaultConnectionState } from "./connection.state";
import { openTransport, closeDevices, isLedgerTransportSupported } from "@/app/contexts/Ledger/transport";
import { useEnvironmentContext } from "@/app/contexts/Environment";
import { toasts } from "@/app/services";
import { useLedgerImport } from "@/app/contexts/Ledger/hooks/import";
import { persistLedgerConnection } from "@/app/contexts/Ledger/utils/connection";
import { Id } from "react-toastify";

export const useLedgerConnection = () => {
	const { t } = useTranslation();

	const { env } = useEnvironmentContext();
	const [state, dispatch] = useReducer(connectionReducer, defaultConnectionState);
	const abortRetryReference = useRef<boolean>(false);

	const [deviceName, setDeviceName] = useState<string | undefined>();
	const { device, isBusy, isConnected, isWaiting, error } = state;

	const { importLedgerWallets } = useLedgerImport({ device, env });
	const connectedToast = useRef<Id>(undefined);

	useEffect(() => {
		if (deviceName) {
			if (connectedToast.current) {
				return;
			}

			if (isConnected) {
				connectedToast.current = toasts.success(t("COMMON.LEDGER_CONNECTED", { device: deviceName }));
				setTimeout(() => (connectedToast.current = undefined), 2000);
			} else {
				connectedToast.current = undefined;
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

			const deviceItem = { id: deviceModel?.id || "nanoS", path: descriptor, type: "add" as const };

			dispatch(deviceItem);
			return deviceItem;
		} catch (error) {
			dispatch({ message: error.message, type: "failed" });
		}
	}, []);

	const handleLedgerConnectionError = useCallback(
		async (error: { statusText?: string; message: string }, profile: Contracts.IProfile) => {
			try {
				await disconnect();
				await resetConnectionState();
			} catch {
				//
			}

			if (error.message === "COMPATIBILITY_ERROR") {
				return dispatch({ message: t("WALLETS.MODAL_LEDGER_WALLET.COMPATIBILITY_ERROR"), type: "failed" });
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
						coin: profile.activeNetwork().name(),
					}),
					type: "failed",
				});
			}

			dispatch({ message: error.message, type: "failed" });
		},
		[dispatch, t],
	);

	const isAttemptingConnect = useRef(false);

	const connect = useCallback(async (profile: Contracts.IProfile, retryOptions?: Options) => {
		if (isAttemptingConnect.current) {
			return;
		}

		isAttemptingConnect.current = true;

		if (!isLedgerTransportSupported()) {
			handleLedgerConnectionError({ message: "COMPATIBILITY_ERROR" }, profile);
			return;
		}

		const options = retryOptions || { factor: 1, randomize: false, retries: 50 };

		await resetConnectionState();

		dispatch({ type: "waiting" });
		abortRetryReference.current = false;

		try {
			await persistLedgerConnection({
				hasRequestedAbort: () => abortRetryReference.current,
				ledgerService: profile.ledger(),
				options,
			});

			dispatch({ type: "connected" });
		} catch (connectError) {
			handleLedgerConnectionError(connectError, profile);
		}

		isAttemptingConnect.current = false;
	}, []);

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
