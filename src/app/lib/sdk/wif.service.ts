/* istanbul ignore file */
/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */

import { ConfigRepository } from "./coins";
import { IContainer } from "./container.contracts";
import { NotImplemented } from "./exceptions";
import { BindingType } from "./service-provider.contract";
import { IdentityOptions } from "./shared.contract";
import { WIFDataTransferObject, WIFService } from "./wif.contract";

export class AbstractWIFService implements WIFService {
	protected readonly configRepository: ConfigRepository;

	public constructor(container: IContainer) {
		this.configRepository = container.get(BindingType.ConfigRepository);
	}

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
