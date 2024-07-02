import { Environment } from "@ardenthq/sdk-profiles";

import { env } from "@/utils/testing-library";

import { initializeEnvironment } from "./environment";

describe("initializeEnvironment", () => {
	beforeEach(() => {
		env.reset();
	});

	it("initializes the environment", () => {
		process.env.REACT_APP_IS_UNIT = "1";

		const environment = initializeEnvironment();

		expect(environment).toBeInstanceOf(Environment);
	});
});
