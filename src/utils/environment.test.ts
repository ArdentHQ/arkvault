import { Environment } from "@ardenthq/sdk-profiles";
import { initializeEnvironment } from "./environment";
import { env } from "@/utils/testing-library";

describe("initializeEnvironment", () => {
	beforeEach(() => {
		env.reset();
	});

	it("initializes the environment", () => {
		process.env.REACT_APP_IS_UNIT = "0";

		const environment = initializeEnvironment();

		expect(environment).toBeInstanceOf(Environment);
	});

	it("initializes the environment in unit environment", () => {
		process.env.REACT_APP_IS_UNIT = "1";

		const environment = initializeEnvironment();

		expect(environment).toBeInstanceOf(Environment);
	});
});
