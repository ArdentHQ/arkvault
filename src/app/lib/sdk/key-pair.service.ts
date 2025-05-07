/* istanbul ignore file */
/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */

import { ConfigRepository } from "./coins";
import { IContainer } from "./container.contracts";
import { NotImplemented } from "./exceptions";
import { KeyPairDataTransferObject, KeyPairService } from "./key-pair.contract";
import { NetworkHostSelector } from "./network.models";
import { BindingType } from "./service-provider.contract";
import { IdentityOptions } from "./shared.contract";

export class AbstractKeyPairService implements KeyPairService {
	protected readonly configRepository: ConfigRepository;
	protected readonly hostSelector: NetworkHostSelector;

	public constructor(container: IContainer) {
		this.configRepository = container.get(BindingType.ConfigRepository);
		this.hostSelector = container.get(BindingType.NetworkHostSelector);
	}

	public async fromMnemonic(mnemonic: string, options?: IdentityOptions): Promise<KeyPairDataTransferObject> {
		throw new NotImplemented(this.constructor.name, this.fromMnemonic.name);
	}

	public async fromPrivateKey(privateKey: string): Promise<KeyPairDataTransferObject> {
		throw new NotImplemented(this.constructor.name, this.fromPrivateKey.name);
	}

	public async fromWIF(wif: string): Promise<KeyPairDataTransferObject> {
		throw new NotImplemented(this.constructor.name, this.fromWIF.name);
	}

	public async fromSecret(secret: string): Promise<KeyPairDataTransferObject> {
		throw new NotImplemented(this.constructor.name, this.fromSecret.name);
	}
}
