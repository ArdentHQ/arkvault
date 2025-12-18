import { UrlValidationMiddleware } from "./UrlValidationMiddleware";
import { env, getMainsailProfileId } from "@/utils/testing-library";
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
		const redirect = vi.fn();
		const parameters = { env, location, redirect };

		expect(subject.handler(parameters)).toBe(true);
	});

	it("should redirect to home for unknown url", () => {
		const location = {
			pathname: "/unknown",
		};
		const redirect = vi.fn();
		const parameters = { env, location, navigate: vi.fn(), redirect };

		expect(subject.handler(parameters)).toBe(false);
		expect(parameters.navigate).toHaveBeenCalledWith("/");
	});

	it("should redirect to dashboard when no addresses added", async () => {
		const emptyProfile = await env.profiles().create("empty profile");

		await env.profiles().restore(emptyProfile);
		await emptyProfile.sync();

		const location = {
			pathname: `/profiles/${emptyProfile.id()}/votes`,
		};

		const redirect = vi.fn();
		const parameters = { env, location, navigate: vi.fn(), redirect };

		expect(subject.handler(parameters)).toBe(true);
		expect(parameters.navigate).toHaveBeenCalledWith(`/profiles/${emptyProfile.id()}/dashboard`);
	});

	it("should validate profile in url", () => {
		const location = {
			pathname: `/profiles/${getMainsailProfileId()}/dashboard`,
		};
		const redirect = vi.fn();
		const parameters = { env, location, navigate: vi.fn(), redirect };

		expect(subject.handler(parameters)).toBe(true);
	});

	it("should redirect to home if profile is not found in url", () => {
		const location = {
			pathname: "/profiles/1/dashboard",
		};
		const redirect = vi.fn();
		const parameters = { env, location, navigate: vi.fn(), redirect };

		expect(subject.handler(parameters)).toBe(false);
		expect(parameters.navigate).toHaveBeenCalledWith("/");
	});
});
