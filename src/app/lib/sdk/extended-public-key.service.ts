/* istanbul ignore file */
/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */

import { BindingType } from "./service-provider.contract";
import { ConfigRepository } from "./coins";
import { ExtendedPublicKeyService } from "./extended-public-key.contract";
import { IContainer } from "./container.contracts";
import { IdentityOptions } from "./shared.contract";
import { NotImplemented } from "./exceptions";

export class AbstractExtendedPublicKeyService implements ExtendedPublicKeyService {
	protected readonly configRepository: ConfigRepository;

	public constructor(container: IContainer) {
		this.configRepository = container.get(BindingType.ConfigRepository);
	}

	public async fromMnemonic(mnemonic: string, options?: IdentityOptions): Promise<string> {
		throw new NotImplemented(this.constructor.name, this.fromMnemonic.name);
	}

	public async verifyPublicKeyWithBLS(publicKey: string): boolean {
		throw new NotImplemented(this.constructor.name, this.verifyPublicKeyWithBLS.name);
	}
}
