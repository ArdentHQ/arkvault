import { Contracts } from "@ardenthq/sdk";
import { LedgerTransportFactory } from "@ardenthq/sdk-ledger";

import { isUnit } from "@/utils/test-helpers";

export const supportedTransport = async () => new LedgerTransportFactory().supportedTransport();

export const closeDevices = async () => {
	const transport = await supportedTransport();
	const devices = await transport.list();

	for (const device of devices) {
		try {
			await device.close();
		} catch {
			// Device is not opened. Ignore.
		}
	}
};

export const isLedgerTransportSupported = () => {
	if (isUnit()) {
		return true;
	}

	//@ts-ignore
	return !!navigator.usb || !!navigator.hid;
};

// Assumes user has already granted permission.
// Won't trigger the native permission dialog.
export const connectedTransport = async () => {
	const transport = await supportedTransport();

	try {
		return await transport.openConnected();
	} catch (error) {
		// `transport.openConnected()` calls device.open() internally,
		// and throws the error below when called multiple times.
		// To ensure the transport is always provided,
		// close all opened devices, re-open transport, and retry.
		if (error.message === "The device is already open.") {
			await closeDevices();
			await openTransport();
			return connectedTransport();
		}

		throw error;
	}
};

/* istanbul ignore next -- @preserve */
const onComplete = () => null;

// Listen to WebUSB devices and emit ONE device that was either accepted before,
// if not it will trigger the native permission UI.

// Important: it must be called in the context of a UI click.
export const openTransport = async (): Promise<Contracts.LedgerTransport> => {
	const transport = await supportedTransport();

	return new Promise((resolve, reject) =>
		transport.listen({
			complete: onComplete,
			error: reject,
			next: ({ type, descriptor, deviceModel }) => {
				if (type === "add") {
					return resolve({ descriptor, deviceModel });
				}

				return resolve({});
			},
		}),
	);
};
