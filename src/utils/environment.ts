import { Environment } from "@/app/lib/profiles";
import { StubStorage } from "@/tests/mocks";
import { httpClient } from "@/app/services";
import { isE2E, isUnit } from "@/utils/test-helpers";

export const initializeEnvironment = (): Environment => new Environment({
	coins: {},
	httpClient,
	storage: isE2E() || isUnit() ? new StubStorage() : "indexeddb",
});
