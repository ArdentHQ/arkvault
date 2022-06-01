import { UrlValidationMiddleware } from "./UrlValidationMiddleware";
import { env, getDefaultProfileId } from "@/utils/testing-library";
import { Middleware } from "@/router/router.types";

let subject: Middleware;

describe("UrlValidationMiddleware", () => {
	beforeEach(() => {
		subject = new UrlValidationMiddleware();
	});

	it("should ignore validation for home", () => {
		const location = {
			pathname: "/",
		};
		const redirect = jest.fn();
		const parameters = { env, location, redirect };

		expect(subject.handler(parameters)).toBe(true);
	});

	it("should redirect to home for unknown url", () => {
		const location = {
			pathname: "/unknown",
		};
		const redirect = jest.fn();
		const parameters = { env, history: { replace: jest.fn() }, location, redirect };

		expect(subject.handler(parameters)).toBe(false);
		expect(parameters.history.replace).toHaveBeenCalledWith("/");
	});

	it("should validate profile in url", () => {
		const location = {
			pathname: `/profiles/${getDefaultProfileId()}/dashboard`,
		};
		const redirect = jest.fn();
		const parameters = { env, history: { replace: jest.fn() }, location, redirect };

		expect(subject.handler(parameters)).toBe(true);
	});

	it("should redirect to home if profile is not found in url", () => {
		const location = {
			pathname: "/profiles/1/dashboard",
		};
		const redirect = jest.fn();
		const parameters = { env, history: { replace: jest.fn() }, location, redirect };

		expect(subject.handler(parameters)).toBe(false);
		expect(parameters.history.replace).toHaveBeenCalledWith("/");
	});
});
