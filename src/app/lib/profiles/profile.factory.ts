import { UUID } from "@ardenthq/arkvault-crypto";

import { IProfile, IProfileFactory } from "./contracts.js";
import { Profile } from "./profile.js";
import { Environment } from "./environment.js";

export class ProfileFactory implements IProfileFactory {
	/** {@inheritDoc IProfileFactory.fromName} */
	public static fromName(name: string, env: Environment): IProfile {
		return new Profile({ data: "", id: UUID.random(), name }, env);
	}
}
