/* istanbul ignore file */
/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */

import { AddressDataTransferObject, AddressService } from "./address.contract";
import { ConfigRepository } from "./coins";
import { IContainer } from "./container.contracts";
import { NotImplemented } from "./exceptions";
import { NetworkHostSelector } from "./network.models";
import { BindingType } from "./service-provider.contract";
import { IdentityOptions, MultisignatureAddressInput } from "./shared.contract";

export class AbstractAddressService implements AddressService {
	protected readonly configRepository: ConfigRepository;
	protected readonly hostSelector: NetworkHostSelector;

	public constructor(container: IContainer) {
		this.configRepository = container.get(BindingType.ConfigRepository);
		this.hostSelector = container.get(BindingType.NetworkHostSelector);
	}

	public async fromMnemonic(mnemonic: string, options?: IdentityOptions): Promise<AddressDataTransferObject> {
		throw new NotImplemented(this.constructor.name, this.fromMultiSignature.name);
	}

	public async fromMultiSignature(
		input: MultisignatureAddressInput,
		options?: IdentityOptions,
	): Promise<AddressDataTransferObject> {
		throw new NotImplemented(this.constructor.name, this.fromMultiSignature.name);
	}

	public async fromPublicKey(publicKey: string, options?: IdentityOptions): Promise<AddressDataTransferObject> {
		throw new NotImplemented(this.constructor.name, this.fromMultiSignature.name);
	}

	public async fromPrivateKey(privateKey: string, options?: IdentityOptions): Promise<AddressDataTransferObject> {
		throw new NotImplemented(this.constructor.name, this.fromPrivateKey.name);
	}

	public async fromWIF(wif: string, options?: IdentityOptions): Promise<AddressDataTransferObject> {
		throw new NotImplemented(this.constructor.name, this.fromWIF.name);
	}

	public async fromSecret(secret: string, options?: IdentityOptions): Promise<AddressDataTransferObject> {
		throw new NotImplemented(this.constructor.name, this.fromSecret.name);
	}

	public async validate(address: string): Promise<boolean> {
		throw new NotImplemented(this.constructor.name, this.fromMultiSignature.name);
	}
}
