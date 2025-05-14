/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */

import { UsernameDataCollection } from "./usernames.collection";
import { UsernamesService } from "./usernames.contract";

export class AbstractUsernamesService implements UsernamesService {
	usernames(): Promise<UsernameDataCollection> {
		return Promise.resolve(new UsernameDataCollection([]));
	}
}
