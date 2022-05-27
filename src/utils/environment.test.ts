import { Environment } from "@payvo/sdk-profiles";
import { initializeEnvironment } from "./environment";
import { env } from "@/utils/testing-library";

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
