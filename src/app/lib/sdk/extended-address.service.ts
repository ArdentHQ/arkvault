/* istanbul ignore file */
/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */

import { NotImplemented } from "./exceptions";
import { ExtendedAddressDataTransferObject, ExtendedAddressService } from "./extended-address.contract";

export class AbstractExtendedAddressService implements ExtendedAddressService {
	public async fromMnemonic(mnemonic: string, pageSize: number): Promise<ExtendedAddressDataTransferObject[]> {
		throw new NotImplemented(this.constructor.name, this.fromMnemonic.name);
	}

	public async fromPrivateKey(privateKey: string, pageSize: number): Promise<ExtendedAddressDataTransferObject[]> {
		throw new NotImplemented(this.constructor.name, this.fromPrivateKey.name);
	}
}
