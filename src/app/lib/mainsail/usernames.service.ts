import { Collections, Services } from "@/app/lib/sdk";

export class UsernamesService extends Services.AbstractUsernamesService {
	public override async usernames(addresses: string[]): Promise<Collections.UsernameDataCollection> {
		return await this.clientService.usernames(addresses);
	}
}
