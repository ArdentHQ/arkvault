import { UsernameDataCollection } from "./usernames.collection";

export interface UsernamesService {
	usernames(addresses: string[]): Promise<UsernameDataCollection>;
}
