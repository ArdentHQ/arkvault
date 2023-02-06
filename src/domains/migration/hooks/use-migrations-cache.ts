import { useCallback, useEffect, useMemo, useState } from "react";
import { useEnvironmentContext } from "@/app/contexts";
import { MigrationRepository } from "@/repositories/migration.repository";
import { Migration } from "@/domains/migration/migration.contracts";

export const useMigrationsCache = ({ profile }) => {
	const [repository, setRepository] = useState<MigrationRepository>();
	const { env, persist } = useEnvironmentContext();

	// Initialize repository when a new profile is loaded
	useEffect(() => {
		if (profile) {
			const repository = new MigrationRepository(profile, env.data());
			setRepository(repository);
		} else {
			setRepository(undefined);
		}
	}, [profile, env]);

	const storeMigrations = useCallback(
		async (migrations: Migration[]) => {
			repository!.set(migrations);

			await persist();
		},
		[repository, persist],
	);

	const getMigrations = useCallback((): Migration[] | undefined => repository!.get(), [repository]);

	const cacheIsReady = useMemo(() => !!repository, [repository]);

	return { cacheIsReady, getMigrations, storeMigrations };
};
