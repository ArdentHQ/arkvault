import { UUID } from "@ardenthq/sdk-cryptography";

import { IProfile, IProfileFactory } from "./contracts.js";
import { Profile } from "./profile.js";

export class ProfileFactory implements IProfileFactory {
	/** {@inheritDoc IProfileFactory.fromName} */
	public static fromName(name: string): IProfile {
		return new Profile({ data: "", id: UUID.random(), name });
	}
}
