import { PreloadMiddleware } from "./PreloadMiddleware";
import { DashboardRoutes } from "@/domains/dashboard/routing";
import { ProfileRoutes } from "@/domains/profile/routing";
import { SettingRoutes } from "@/domains/setting/routing";
import { ContactRoutes } from "@/domains/contact/routing";
import { ExchangeRoutes } from "@/domains/exchange/routing";
import { MessageRoutes } from "@/domains/message/routing";
import { NewsRoutes } from "@/domains/news/routing";
import { VoteRoutes } from "@/domains/vote/routing";
import { WalletRoutes } from "@/domains/wallet/routing";
import { TransactionRoutes } from "@/domains/transaction/routing";

describe("PreloadMiddleware", () => {
	let subject: PreloadMiddleware;

	beforeEach(() => {
		subject = new PreloadMiddleware();
	});

	it("returns true when current path is not root and does not start with /profiles", () => {
		expect(subject.handler({ location: { pathname: "/some-path" } } as any)).toBe(true);
	});

	it("preloads dashboard, profile, setting, and contact routes when path is root", () => {
		const rootSpies = [...DashboardRoutes, ...ProfileRoutes, ...SettingRoutes, ...ContactRoutes].map((route) =>
			jest.spyOn(route.component as any, "preload"),
		);

		const profileSpies = [
			...ExchangeRoutes,
			...MessageRoutes,
			...NewsRoutes,
			...WalletRoutes,
			...TransactionRoutes,
			...VoteRoutes,
		].map((route) => jest.spyOn(route.component as any, "preload"));

		const canActivate = subject.handler({ location: { pathname: "/" } } as any);

		expect(canActivate).toBe(true);

		for (const spy of rootSpies) {
			expect(spy).toHaveBeenCalledWith();
		}

		for (const spy of profileSpies) {
			expect(spy).not.toHaveBeenCalled();
		}

		for (const spy of [...rootSpies, ...profileSpies]) {
			spy.mockRestore();
		}
	});

	it("preloads exchange, news, wallet, transaction, and vote routes when path starts with /profile", () => {
		const rootSpies = [...DashboardRoutes, ...ProfileRoutes, ...SettingRoutes, ...ContactRoutes].map((route) =>
			jest.spyOn(route.component as any, "preload"),
		);

		const profileSpies = [
			...ExchangeRoutes,
			...NewsRoutes,
			...WalletRoutes,
			...TransactionRoutes,
			...VoteRoutes,
		].map((route) => jest.spyOn(route.component as any, "preload"));

		const canActivate = subject.handler({ location: { pathname: "/profiles" } } as any);

		expect(canActivate).toBe(true);

		for (const spy of rootSpies) {
			expect(spy).not.toHaveBeenCalled();
		}

		for (const spy of profileSpies) {
			expect(spy).toHaveBeenCalledWith();
		}

		for (const spy of [...rootSpies, ...profileSpies]) {
			spy.mockRestore();
		}
	});
});
