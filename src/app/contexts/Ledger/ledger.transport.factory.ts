// Based on https://github.com/near/near-ledger-js/blob/master/supportedTransports.js
import LedgerHID from "@ledgerhq/hw-transport-webhid";
import LedgerUSB from "@ledgerhq/hw-transport-webusb";
import platform from "platform";

export class LedgerTransportFactory {
	public async supportedTransport(): Promise<typeof LedgerHID | typeof LedgerUSB> {
		const [supportsHID, supportsUSB] = await Promise.all([this.#supportsHID(), this.#supportsUSB()]);

		if (supportsHID) {
			return LedgerHID;
		}

		if (supportsUSB) {
			return LedgerUSB;
		}

		throw new Error("No transports appear to be supported.");
	}

	async #supportsHID(): Promise<boolean> {
		try {
			return await LedgerHID.isSupported();
		} catch {
			return false;
		}
	}

	async #supportsUSB(): Promise<boolean> {
		try {
			if (await LedgerUSB.isSupported()) {
				return platform.os?.family !== "Windows" && platform.name !== "Opera";
			}

			return false;
		} catch {
			return false;
		}
	}
}
