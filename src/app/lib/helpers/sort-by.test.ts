import { describeWithContext } from "@ardenthq/sdk-test";

import { sortBy } from "./sort-by";

describeWithContext(
	"sortBy",
	() => ({
		dummies: [
			{ name: "John", age: 30 },
			{ name: "Jane", age: 40 },
			{ name: "Andrew", age: 18 },
			{ name: "Bob", age: 18 },
		],
	}),
	({ assert, it, nock, loader }) => {
		it("should sort records without iteratees", (context) => {
			assert.equal(sortBy([...context.dummies]), [
				{ name: "John", age: 30 },
				{ name: "Jane", age: 40 },
				{ name: "Andrew", age: 18 },
				{ name: "Bob", age: 18 },
			]);
		});

		it("should sort records by string", (context) => {
			assert.equal(sortBy([...context.dummies], "age"), [
				{ name: "Andrew", age: 18 },
				{ name: "Bob", age: 18 },
				{ name: "John", age: 30 },
				{ name: "Jane", age: 40 },
			]);
		});

		it("should sort records by array", (context) => {
			assert.equal(sortBy([...context.dummies], ["age"]), [
				{ name: "Andrew", age: 18 },
				{ name: "Bob", age: 18 },
				{ name: "John", age: 30 },
				{ name: "Jane", age: 40 },
			]);
		});
	},
);
