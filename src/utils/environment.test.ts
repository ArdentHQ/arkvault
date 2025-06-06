import { LocalStorage } from "@/app/lib/profiles/local.storage";
import { Environment } from "@/app/lib/profiles";
import { initializeEnvironment } from "./environment";
import { env } from "@/utils/testing-library";
import { StubStorage } from "@/tests/mocks";
import * as TestHelpers from "@/utils/test-helpers";
import { expect, vi } from "vitest";

describe("initializeEnvironment", () => {
	beforeEach(() => {
		env.reset();
	});

	it("initializes the environment", () => {
		process.env.REACT_APP_IS_UNIT = "1";

		const environment = initializeEnvironment();

		expect(environment).toBeInstanceOf(Environment);
	});

	it.each([
		[true, false],
		[false, true],
		[true, true],
	])("uses stub storage on tests environments", (isE2E, isUnit) => {
		const isE2EMock = vi.spyOn(TestHelpers, "isE2E").mockReturnValue(isE2E);
		const isUnitMock = vi.spyOn(TestHelpers, "isUnit").mockReturnValue(isUnit);

		const environment = initializeEnvironment();

		expect(environment.storage()).toBeInstanceOf(StubStorage);

		isUnitMock.mockRestore();
		isE2EMock.mockRestore();
	});

	it("uses indexeddb storage on production", () => {
		const isE2EMock = vi.spyOn(TestHelpers, "isE2E").mockReturnValue(false);
		const isUnitMock = vi.spyOn(TestHelpers, "isUnit").mockReturnValue(false);

		const environment = initializeEnvironment();

		expect(environment.storage()).toBeInstanceOf(LocalStorage);

		isE2EMock.mockRestore();
		isUnitMock.mockRestore();
	});
});
