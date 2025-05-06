/* istanbul ignore file */
/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */

import { PublicKeyDataTransferObject, PublicKeyService } from "./public-key.contract";

import { BindingType } from "./service-provider.contract";
import { ConfigRepository } from "./coins";
import { IContainer } from "./container.contracts";
import { IdentityOptions } from "./shared.contract";
import { NetworkHostSelector } from "./network.models";
import { NotImplemented } from "./exceptions";

export class AbstractPublicKeyService implements PublicKeyService {
	protected readonly configRepository: ConfigRepository;
	protected readonly hostSelector: NetworkHostSelector;

	public constructor(container: IContainer) {
		this.configRepository = container.get(BindingType.ConfigRepository);
		this.hostSelector = container.get(BindingType.NetworkHostSelector);
	}

	public async fromMnemonic(mnemonic: string, options?: IdentityOptions): Promise<PublicKeyDataTransferObject> {
		throw new NotImplemented(this.constructor.name, this.fromMnemonic.name);
	}

	public async fromWIF(wif: string): Promise<PublicKeyDataTransferObject> {
		throw new NotImplemented(this.constructor.name, this.fromWIF.name);
	}

	public async fromSecret(secret: string): Promise<PublicKeyDataTransferObject> {
		throw new NotImplemented(this.constructor.name, this.fromSecret.name);
	}

	public verifyPublicKeyWithBLS(publicKey: string): boolean {
		throw new NotImplemented(this.constructor.name, this.verifyPublicKeyWithBLS.name);
	}
}
