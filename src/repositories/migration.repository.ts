import { Contracts } from "@ardenthq/sdk-profiles";
import { Migration, MigrationTransactionStatus } from "@/domains/migration/migration.contracts";

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

	public hasPending(): boolean {
		return this.all().some((migration) => migration.status === MigrationTransactionStatus.Pending);
	}

	public set(data: Migration[]): void {
		const all = this.#data.get(STORAGE_KEY, {}) as MigrationMap;

		all[this.#profile.id()] = data;

		this.#data.set(STORAGE_KEY, all);
	}

	public add(item: Migration): void {
		const all = this.#data.get(STORAGE_KEY, {}) as MigrationMap;

		const migrations = all[this.#profile.id()] || [];
		const index = migrations.findIndex((migration) => migration.id === item.id);

		if (index > -1) {
			migrations[index] = item;
			this.#data.set(STORAGE_KEY, all);
			return;
		}

		all[this.#profile.id()] = [...(all[this.#profile.id()] || []), item];

		this.#data.set(STORAGE_KEY, all);
	}

	public remove(items: Migration[]): void {
		const ids = new Set(items.map((item) => item.id));

		this.set(this.all().filter((item) => !ids.has(item.id)));
	}

	public markAsRead(item: Migration): void {
		const all = this.#data.get(STORAGE_KEY, {}) as MigrationMap;

		const migrations = all[this.#profile.id()];

		const index = migrations.findIndex((migration) => migration.id === item.id);

		migrations[index] = {
			...item,
			readAt: Date.now(),
		};

		all[this.#profile.id()] = migrations;

		this.#data.set(STORAGE_KEY, all);
	}
}
