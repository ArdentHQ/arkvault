import { Contracts } from "@ardenthq/sdk-profiles";
import { MigrationRepository } from "@/repositories/migration.repository";

import { env, getDefaultProfileId } from "@/utils/testing-library";

let profile: Contracts.IProfile;
let profile2: Contracts.IProfile;

describe("MigrationRepository", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		profile2 = await env.profiles().create("new profile 2");
	});

	it("return an empty array for a new repository", () => {
		const repository = new MigrationRepository(profile, env.data());

		expect(repository.all()).toEqual([]);
	});

	it("stores migrations for one profile", () => {
		const repository = new MigrationRepository(profile, env.data());
		const repository2 = new MigrationRepository(profile2, env.data());

		repository.set([{ id: "1" }, { id: "2" }]);

		expect(repository.all()).toHaveLength(2);

		expect(repository2.all()).toHaveLength(0);
	});
});
