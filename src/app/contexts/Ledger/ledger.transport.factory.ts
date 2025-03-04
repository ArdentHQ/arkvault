// Based on https://github.com/near/near-ledger-js/blob/master/supportedTransports.js
// import LedgerHID from "@ledgerhq/hw-transport-webhid";
// import LedgerUSB from "@ledgerhq/hw-transport-webusb";
import platform from "platform";

export class LedgerTransportFactory {
	public async supportedTransport(): Promise<typeof LedgerHID | typeof LedgerUSB> {
		// const [supportsHID, supportsUSB] = await Promise.all([this.#supportsHID(), this.#supportsUSB()]);

		// if (supportsHID) {
		// 	return LedgerHID;
		// }
		//
		// if (supportsUSB) {
		// 	return LedgerUSB;
		// }
		//
		throw new Error("No transports appear to be supported.");
	}

	async #supportsHID(): Promise<boolean> {
		throw new NotImplemented(this.constructor.name, this.#supportsHID.name);
	}

	async #supportsUSB(): Promise<boolean> {
		throw new NotImplemented(this.constructor.name, this.#supportsUSB.name);
		// try {
		// 	if (await LedgerUSB.isSupported()) {
		// 		return platform.os?.family !== "Windows" && platform.name !== "Opera";
		// 	}
		//
		// 	return false;
		// } catch {
		// 	return false;
		// }
	}
}
