import { LedgerTransportFactory } from "@/app/contexts/Ledger/ledger.transport.factory";
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

type MockTransport = ReturnType<typeof LedgerTransportFactory.prototype.supportedTransport>;

interface TransportObserver {
	error?: (errorValue: Error) => void;
	next?: (value: unknown) => void;
	complete?: () => void;
}

const mockLedgerTransportListener = (
	observerMock: ObserverMock,
	openConnectedHandler?: () => void,
	devicesListHandler?: () => LedgerDevice[],
) =>
	vi.spyOn(LedgerTransportFactory.prototype, "supportedTransport").mockImplementation(function () {
		return Promise.resolve({
			list: () => devicesListHandler?.() ?? [],
			listen: (observer: unknown) => {
				const transportObserver = observer as TransportObserver;

				if (observerMock.error && transportObserver.error) {
					return transportObserver.error(observerMock.error());
				}

				if (observerMock.next && transportObserver.next) {
					return transportObserver.next({ descriptor: "", type: "add", ...observerMock.next() });
				}
			},
			openConnected: async () => openConnectedHandler?.() ?? openTransportReplayer(RecordStore.fromString("")),
		}) as unknown as MockTransport;
	});

const mockNanoXDevices = (): ObserverMock => ({
	next: () => ({ deviceModel: { id: "nanoX", productName: "Nano X" } }),
});

export const mockNanoXTransport = (device?: LedgerDevice) =>
	mockLedgerTransportListener({
		next: () => ({ deviceModel: { id: "nanoX", productName: "Nano X" }, ...device }),
	});

export const mockNanoSTransport = (device?: LedgerDevice) =>
	mockLedgerTransportListener({
		next: () => ({ deviceModel: { id: "nanoS", productName: "Nano S" }, ...device }),
	});

export const mockLedgerTransportError = (error?: string) =>
	mockLedgerTransportListener({
		error: () => new Error(error ?? "error"),
	});

export const mockConnectedTransport = (openConnectedHandler: () => void) =>
	mockLedgerTransportListener(mockNanoXDevices(), openConnectedHandler);

export const mockLedgerDevicesList = (devicesListHandler: () => LedgerDevice[]) =>
	mockLedgerTransportListener(mockNanoXDevices(), undefined, devicesListHandler);
