import { describe, expect, it } from "vitest";
import Joi from "joi";

import { Validator } from "./validator";

describe("Validator", () => {
	const schema = Joi.object({
		age: Joi.number().required(),
		name: Joi.string().required(),
	});

	it("should pass validation with correct data", () => {
		const validator = new Validator();
		const data = { age: 30, name: "John Doe" };
		const value = validator.validate(data, schema);

		expect(validator.passes()).toBe(true);
		expect(validator.fails()).toBe(false);
		expect(validator.errors()).toBeUndefined();
		expect(validator.error()).toBeUndefined();
		expect(value).toEqual(data);
	});

	it("should fail validation with incorrect data", () => {
		const validator = new Validator();
		const data = { name: "John Doe" }; // age is missing
		const value = validator.validate(data, schema);

		expect(validator.passes()).toBe(false);
		expect(validator.fails()).toBe(true);
		expect(validator.errors()).toEqual(['"age" is required']);
		expect(validator.error()).toBeInstanceOf(Joi.ValidationError);
		expect(value).toEqual(data);
	});

	it("should return the full error object", () => {
		const validator = new Validator();
		const data = { name: "test" }; // age is missing
		validator.validate(data, schema);
		const error = validator.error();

		expect(error).toBeInstanceOf(Joi.ValidationError);
		expect(error?.details).toHaveLength(1);
	});

	it("should reset errors on subsequent validations", () => {
		const validator = new Validator();
		const failingData = {};
		validator.validate(failingData, schema);

		expect(validator.fails()).toBe(true);

		const passingData = { age: 25, name: "Jane Doe" };
		validator.validate(passingData, schema);

		expect(validator.passes()).toBe(true);
		expect(validator.errors()).toBeUndefined();
	});
});
