import { WalletMiddleware } from "./middleware";
import { env, getDefaultProfileId } from "@/utils/testing-library";
import { Middleware } from "@/router/router.types";

let subject: Middleware;

describe("WalletMiddleware", () => {
	beforeEach(() => {
		subject = new WalletMiddleware();
	});

	it("should return true if path does not match", () => {
		const location = {
			pathname: "/profiles/create",
		};
		const redirect = vi.fn();
		const parameters = { env, location, redirect };

		// @ts-ignore
		expect(subject.handler(parameters)).toBe(true);
	});

	it("should return true if path matches but is a subrouter", () => {
		const location = {
			pathname: "/profiles/1/wallets/create",
		};
		const redirect = vi.fn();
		const parameters = { env, location, redirect };

		// @ts-ignore
		expect(subject.handler(parameters)).toBe(true);
	});

	it("should return false if path matches but the wallet does not exist", () => {
		const location = {
			pathname: "/profiles/1/wallets/1",
		};
		const redirect = vi.fn();
		const parameters = { env, location, redirect };

		// @ts-ignore
		expect(subject.handler(parameters)).toBe(false);
		expect(redirect).toHaveBeenCalledWith("/profiles/1/dashboard");
	});

	it("should return true if path matches and wallet exists", () => {
		const profile = env.profiles().findById(getDefaultProfileId());
		const wallet = profile.wallets().values()[0];

		const location = {
			pathname: `/profiles/${profile.id()}/wallets/${wallet.id()}`,
		};
		const redirect = vi.fn();
		const parameters = { env, location, redirect };

		// @ts-ignore
		expect(subject.handler(parameters)).toBe(true);
	});
});
