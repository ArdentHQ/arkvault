import * as SDKLedger from "@ardenthq/sdk-ledger";
import { openTransportReplayer, RecordStore } from "@ledgerhq/hw-transport-mocker";

interface LedgerDevice {
	type?: string;
	descriptor?: string;
	deviceModel: {
		id: string;
		productName?: string;
	};
}

interface ObserverMock {
	complete?: () => void;
	error?: () => Error;
	next?: () => LedgerDevice;
}

interface TransportMockProperties {
	observerMock: ObserverMock;
	openConnectedHandler?: () => void;
	devicesListHandler?: () => void;
}

const mockLedgerTransportListener = ({
	observerMock,
	openConnectedHandler,
	devicesListHandler,
}: TransportMockProperties) =>
	// @ts-ignore
	jest.spyOn(SDKLedger, "LedgerTransportFactory").mockImplementation(() => ({
		supportedTransport: () =>
			// @ts-ignore
			Promise.resolve({
				list: () => {
					if (devicesListHandler) {
						return devicesListHandler();
					}

					return [];
				},
				listen: (observer: any) => {
					if (observerMock.error) {
						return observer.error(observerMock.error());
					}

					if (observerMock.next) {
						return observer.next({
							descriptor: "",
							type: "add",
							...observerMock.next(),
						});
					}
				},
				openConnected: async () => {
					if (openConnectedHandler) {
						return openConnectedHandler();
					}

					return openTransportReplayer(RecordStore.fromString(""));
				},
			}),
	}));

export const mockNanoSTransport = (device?: LedgerDevice) =>
	mockLedgerTransportListener({
		observerMock: {
			next: () => ({
				deviceModel: { id: "nanoS", productName: "Nano S" },
				...device,
			}),
		},
	});

export const mockNanoXTransport = (device?: LedgerDevice) =>
	mockLedgerTransportListener({
		observerMock: {
			next: () => ({
				deviceModel: { id: "nanoX", productName: "Nano X" },
				...device,
			}),
		},
	});

export const mockLedgerTransportError = (error?: string) =>
	mockLedgerTransportListener({
		observerMock: {
			error: () => new Error(error || "error"),
		},
	});

export const mockConnectedTransport = (openConnectedHandler: () => void) =>
	mockLedgerTransportListener({
		observerMock: {
			next: () => ({
				deviceModel: { id: "nanoX", productName: "Nano X" },
			}),
		},
		openConnectedHandler,
	});

export const mockLedgerDevicesList = (devicesListHandler: () => void) =>
	mockLedgerTransportListener({
		devicesListHandler,
		observerMock: {
			next: () => ({
				deviceModel: { id: "nanoX", productName: "Nano X" },
			}),
		},
	});
