import { describeWithContext } from "@ardenthq/sdk-test";

import { sortByDesc } from "./sort-by-desc";

describeWithContext(
	"sortByDesc",
	() => ({
		dummies: [
			{ name: "Andrew", age: 18 },
			{ name: "Bob", age: 18 },
			{ name: "John", age: 30 },
			{ name: "Jane", age: 40 },
		],
	}),
	({ assert, it, nock, loader }) => {
		it("should sort records without iteratees", (context) => {
			assert.equal(sortByDesc([...context.dummies]), [
				{ name: "Jane", age: 40 },
				{ name: "John", age: 30 },
				{ name: "Bob", age: 18 },
				{ name: "Andrew", age: 18 },
			]);
		});

		it("should sort records by string", (context) => {
			assert.equal(sortByDesc([...context.dummies], "age"), [
				{ name: "Jane", age: 40 },
				{ name: "John", age: 30 },
				{ name: "Andrew", age: 18 },
				{ name: "Bob", age: 18 },
			]);
		});

		it("should sort records by array", (context) => {
			assert.equal(sortByDesc([...context.dummies], ["age"]), [
				{ name: "Jane", age: 40 },
				{ name: "John", age: 30 },
				{ name: "Andrew", age: 18 },
				{ name: "Bob", age: 18 },
			]);
		});
	},
);
