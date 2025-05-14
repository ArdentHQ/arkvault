/* istanbul ignore file */
/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */

import { NotImplemented } from "./exceptions";
import { IdentityOptions } from "./shared.contract";
import { WIFDataTransferObject, WIFService } from "./wif.contract";

export class AbstractWIFService implements WIFService {
	public async fromMnemonic(mnemonic: string, options?: IdentityOptions): Promise<WIFDataTransferObject> {
		throw new NotImplemented(this.constructor.name, this.fromPrivateKey.name);
	}

	public async fromPrivateKey(privateKey: string): Promise<WIFDataTransferObject> {
		throw new NotImplemented(this.constructor.name, this.fromPrivateKey.name);
	}

	public async fromSecret(secret: string): Promise<WIFDataTransferObject> {
		throw new NotImplemented(this.constructor.name, this.fromSecret.name);
	}
}
