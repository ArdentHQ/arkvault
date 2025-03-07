/* istanbul ignore file */

import { ConfigRepository } from "./coins";
import { IContainer } from "./container.contracts";
import { NotImplemented } from "./exceptions";
import { MessageInput, MessageService, SignedMessage } from "./message.contract";
import { NetworkHostSelector } from "./network.models";
import { BindingType } from "./service-provider.contract";

export class AbstractMessageService implements MessageService {
	protected readonly configRepository: ConfigRepository;
	protected readonly hostSelector: NetworkHostSelector;

	public constructor(container: IContainer) {
		this.configRepository = container.get(BindingType.ConfigRepository);
		this.hostSelector = container.get(BindingType.NetworkHostSelector);
	}

	public async sign(input: MessageInput): Promise<SignedMessage> {
		throw new NotImplemented(this.constructor.name, this.sign.name);
	}

	public async verify(input: SignedMessage): Promise<boolean> {
		throw new NotImplemented(this.constructor.name, this.verify.name);
	}
}
