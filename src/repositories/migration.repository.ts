import { Contracts } from "@ardenthq/sdk-profiles";
import { Migration, MigrationTransactionStatus, ProfileMigrations } from "@/domains/migration/migration.contracts";

const STORAGE_KEY = "ark-migration";

export class MigrationRepository {
	readonly #profile: Contracts.IProfile;
	readonly #data: Contracts.IDataRepository;

	public constructor(profile: Contracts.IProfile, data: Contracts.IDataRepository) {
		this.#profile = profile;
		this.#data = data;
	}

	public data(): ProfileMigrations {
		return this.#data.get(STORAGE_KEY, {}) as ProfileMigrations;
	}

	public all(): Migration[] {
		return this.data()[this.#profile.id()] || [];
	}

	public hasPending(): boolean {
		return this.all().some((migration) => migration.status === MigrationTransactionStatus.Pending);
	}

	public set(migrations: Migration[]): void {
		const data = this.data();
		data[this.#profile.id()] = migrations;
		this.#data.set(STORAGE_KEY, data);
	}

	public add(migration: Migration): void {
		const migrations = this.all();

		const index = migrations.findIndex((item) => item.transactionId === migration.transactionId);

		if (index > -1) {
			migrations[index] = migration;
		} else {
			migrations.push(migration);
		}

		this.set(migrations);
	}
}
