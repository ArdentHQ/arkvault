import { IProfile } from "@/app/lib/profiles/profile.contract.js";
import { Contracts, Environment } from "@/app/lib/profiles";
import { DraftTransfer } from "./draft-transfer";

export class DraftTransactionFactory {
	readonly #env: Environment;
	readonly #profile: Contracts.IProfile;

	public constructor({ profile, env }: { profile: IProfile; env: Environment }) {
		this.#env = env;
		this.#profile = profile;
	}

	public transfer(): DraftTransfer {
		return new DraftTransfer({ env: this.#env, profile: this.#profile });
	}
}
