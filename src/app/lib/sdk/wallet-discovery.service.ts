/* istanbul ignore file */
/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */

import { AddressDataTransferObject } from "./address.contract";
import { NotImplemented } from "./exceptions";
import { IdentityOptions } from "./shared.contract";
import { WalletDiscoveryService } from "./wallet-discovery.contract";

export class AbstractWalletDiscoveryService implements WalletDiscoveryService {
	public async fromMnemonic(mnemonic: string, options?: IdentityOptions): Promise<AddressDataTransferObject[]> {
		throw new NotImplemented(this.constructor.name, this.fromMnemonic.name);
	}
}
