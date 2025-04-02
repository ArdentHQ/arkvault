import { describeWithContext } from "@ardenthq/sdk-test";

import { upperFirst } from "./upper-first";

describeWithContext(
	"upperFirst",
	() => ({
		dummies: {
			fred: "Fred",
			FRED: "FRED",
			"test space": "Test space",
		},
	}),
	({ assert, it, nock, loader }) => {
		it("should capitalize the given input", (context) => {
			Object.keys(context.dummies).forEach((key) => {
				assert.is(upperFirst(key), context.dummies[key]);
			});
		});
	},
);
