import { ClientService } from "./client.contract";
import { IContainer } from "./container.contracts";
import { BindingType } from "./service-provider.contract";
import { UsernameDataCollection } from "./usernames.collection";
import { UsernamesService } from "./usernames.contract";

export class AbstractUsernamesService implements UsernamesService {
	protected readonly clientService: ClientService;

	public constructor(container: IContainer) {
		this.clientService = container.get(BindingType.ClientService);
	}

	usernames(addresses: string[]): Promise<UsernameDataCollection> {
		return Promise.resolve(new UsernameDataCollection([]));
	}
}
