// /* eslint-disable promise/always-return */

// /**
//  * Based on https://github.com/Dobby89/promise-all-settled-by-key/blob/master/source/__tests__/index.test.js.
//  */

// import { describe } from "@ardenthq/sdk-test";

// import { promiseAllSettledByKey } from "./promise";

// const promise1 = Promise.resolve(3);
// const promise2 = new Promise((resolve, reject) => setTimeout(reject, 100, "foo error"));
// const promise3 = new Promise((resolve, reject) => setTimeout(reject, 100));

// it("should return all resolved and rejected promises by their key", () =>
// 	promiseAllSettledByKey({
// 		getFoo: promise2,
// 		nope: promise3,
// 		theNumberThree: promise1,
// 	}).then(({ theNumberThree, getFoo, nope }) => {
// 		assert.equal(theNumberThree, { status: "fulfilled", value: 3 });
// 		assert.equal(getFoo, { status: "rejected", value: "foo error" });
// 		assert.equal(nope, { status: "rejected", value: undefined });
// 	}));

// it("should return an empty object if no promises object supplied", () =>
// 	promiseAllSettledByKey().then((settled) => {
// 		assert.equal(settled, {});
// 	}));

// it("should return ONLY resolved promises", () =>
// 	promiseAllSettledByKey(
// 		{
// 			getFoo: promise2,
// 			nope: promise3,
// 			theNumberThree: promise1,
// 		},
// 		{ onlyResolved: true },
// 	).then((results) => {
// 		assert.length(Object.keys(results), 1);
// 		assert.equal(results, {
// 			theNumberThree: { status: "fulfilled", value: 3 },
// 		});
// 	}));

// it("should return undefined if given ONLY rejected promises", () =>
// 	promiseAllSettledByKey(
// 		{
// 			getFoo: promise2,
// 			nope: promise3,
// 		},
// 		{ onlyResolved: true },
// 	).then((results) => {
// 		assert.undefined(results);
// 	}));

// it("should return ONLY rejected promises", () =>
// 	promiseAllSettledByKey(
// 		{
// 			getFoo: promise2,
// 			nope: promise3,
// 			theNumberThree: promise1,
// 		},
// 		{ onlyRejected: true },
// 	).then((results) => {
// 		assert.length(Object.keys(results), 2);
// 		assert.equal(results, {
// 			getFoo: { status: "rejected", value: "foo error" },
// 			nope: { status: "rejected", value: undefined },
// 		});
// 	}));

// it("should return undefined if given ONLY resolved promises", () =>
// 	promiseAllSettledByKey(
// 		{
// 			theNumberThree: promise1,
// 		},
// 		{ onlyRejected: true },
// 	).then((results) => {
// 		assert.undefined(results);
// 	}));

// });
