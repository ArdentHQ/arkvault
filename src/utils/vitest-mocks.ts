import { openTransportReplayer, RecordStore } from "@ledgerhq/hw-transport-mocker";

export function createLedgerTransportFactoryMock() {
	return class LedgerTransportFactoryMock {
		supportedTransport() {
			return Promise.resolve({
				list: () => [],
				listen: () => {},
				openConnected: async () => openTransportReplayer(RecordStore.fromString("")),
			});
		}
	};
}
