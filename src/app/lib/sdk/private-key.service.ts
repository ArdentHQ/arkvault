/* istanbul ignore file */

import { ConfigRepository } from "./coins";
import { IContainer } from "./container.contracts";
import { NotImplemented } from "./exceptions";
import { NetworkHostSelector } from "./network.models";
import { PrivateKeyDataTransferObject, PrivateKeyService } from "./private-key.contract";
import { BindingType } from "./service-provider.contract";
import { IdentityOptions } from "./shared.contract";

export class AbstractPrivateKeyService implements PrivateKeyService {
	protected readonly configRepository: ConfigRepository;
	protected readonly hostSelector: NetworkHostSelector;

	public constructor(container: IContainer) {
		this.configRepository = container.get(BindingType.ConfigRepository);
		this.hostSelector = container.get(BindingType.NetworkHostSelector);
	}

	public async fromMnemonic(mnemonic: string, options?: IdentityOptions): Promise<PrivateKeyDataTransferObject> {
		throw new NotImplemented(this.constructor.name, this.fromMnemonic.name);
	}

	public async fromWIF(wif: string): Promise<PrivateKeyDataTransferObject> {
		throw new NotImplemented(this.constructor.name, this.fromWIF.name);
	}

	public async fromSecret(secret: string): Promise<PrivateKeyDataTransferObject> {
		throw new NotImplemented(this.constructor.name, this.fromSecret.name);
	}
}
