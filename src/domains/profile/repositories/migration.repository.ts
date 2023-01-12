import { Contracts } from "@ardenthq/sdk-profiles";
import { Migration } from "@/domains/migration/migration.contracts";

const STORAGE_KEY = "ark-migration";

type MigrationMap = Record<string, Migration[]>;

export class MigrationRepository {
	readonly #profile: Contracts.IProfile;
	readonly #data: Contracts.IDataRepository;

	public constructor(profile: Contracts.IProfile, data: Contracts.IDataRepository) {
		this.#profile = profile;
		this.#data = data;
	}

	public all(): Migration[] {
		const all = this.#data.get(STORAGE_KEY, {}) as MigrationMap;

		return all[this.#profile.id()] || [];
	}

	// Method for setting the migration data
	public set(data: Migration[]): void {
		const all = this.#data.get(STORAGE_KEY, {}) as MigrationMap;

		all[this.#profile.id()] = data;

		this.#data.set(STORAGE_KEY, all);
	}
}
