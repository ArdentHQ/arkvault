import { Contracts } from "@ardenthq/sdk-profiles";
import { Migration } from "@/domains/migration/migration.contracts";

const STORAGE_KEY = "ark-migrations-cacheTPDsdgadsgsP";

export interface MigrationsPage {
	migrations: Migration[];
	page: number;
}

type MigrationMap = Record<string, MigrationsPage>;

export class MigrationRepository {
	readonly #profile: Contracts.IProfile;
	readonly #data: Contracts.IDataRepository;

	public constructor(profile: Contracts.IProfile, data: Contracts.IDataRepository) {
		this.#profile = profile;
		this.#data = data;
	}

	public get(): MigrationsPage | undefined {
		const all = this.#data.get(STORAGE_KEY, {}) as MigrationMap;

		return all[this.#profile.id()];
	}

	public set(migrations: Migration[], page: number): void {
		const all = this.#data.get(STORAGE_KEY, {}) as MigrationMap;

		all[this.#profile.id()] = {
			migrations,
			page,
		};

		this.#data.set(STORAGE_KEY, all);
	}
}
