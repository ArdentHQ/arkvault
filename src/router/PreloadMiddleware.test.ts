vi.mock("@/domains/dashboard/routing", () => ({
	DashboardRoutes: [{ component: { preload: vi.fn() } }],
}));

vi.mock("@/domains/profile/routing", () => ({
	ProfileRoutes: [{ component: { preload: vi.fn() } }],
}));

vi.mock("@/domains/setting/routing", () => ({
	SettingRoutes: [{ component: { preload: vi.fn() } }],
}));

vi.mock("@/domains/contact/routing", () => ({
	ContactRoutes: [{ component: { preload: vi.fn() } }],
}));

vi.mock("@/domains/exchange/routing", () => ({
	ExchangeRoutes: [{ component: { preload: vi.fn() } }],
}));

vi.mock("@/domains/vote/routing", () => ({
	VoteRoutes: [{ component: { preload: vi.fn() } }],
}));

vi.mock("@/domains/transaction/routing", () => ({
	TransactionRoutes: [{ component: { preload: vi.fn() } }],
}));

vi.mock("@/domains/message/routing", () => ({
	MessageRoutes: [{ component: { preload: vi.fn() } }],
}));

import { PreloadMiddleware } from "./PreloadMiddleware";
import { DashboardRoutes } from "@/domains/dashboard/routing";
import { ProfileRoutes } from "@/domains/profile/routing";
import { SettingRoutes } from "@/domains/setting/routing";
import { ContactRoutes } from "@/domains/contact/routing";
import { ExchangeRoutes } from "@/domains/exchange/routing";
import { MessageRoutes } from "@/domains/message/routing";
import { VoteRoutes } from "@/domains/vote/routing";
import { TransactionRoutes } from "@/domains/transaction/routing";

describe("PreloadMiddleware", () => {
	let subject: PreloadMiddleware;

	beforeEach(() => {
		subject = new PreloadMiddleware();
	});

	it("returns true in test environment", () => {
		process.env.REACT_APP_IS_UNIT = "1";

		expect(subject.handler({ location: { pathname: "/some-path" } } as any)).toBe(true);

		process.env.REACT_APP_IS_UNIT = undefined;
	});

	it("returns true when current path is not root and does not start with /profiles", () => {
		expect(subject.handler({ location: { pathname: "/some-path" } } as any)).toBe(true);
	});

	it("preloads dashboard, profile, setting, and contact routes when path is root", () => {
		const rootSpies = [...DashboardRoutes, ...ProfileRoutes, ...SettingRoutes, ...ContactRoutes].map((route) =>
			vi.spyOn(route.component as any, "preload"),
		);

		const profileSpies = [...ExchangeRoutes, ...VoteRoutes].map((route) =>
			vi.spyOn(route.component as any, "preload"),
		);

		const commonSpies = [...TransactionRoutes, ...MessageRoutes].map((route) =>
			vi.spyOn(route.component as any, "preload"),
		);

		const canActivate = subject.handler({ location: { pathname: "/" } } as any);

		expect(canActivate).toBe(true);

		for (const spy of [...rootSpies, ...commonSpies]) {
			expect(spy).toHaveBeenCalledWith();
		}

		for (const spy of profileSpies) {
			expect(spy).not.toHaveBeenCalled();
		}

		for (const spy of [...rootSpies, ...profileSpies, ...commonSpies]) {
			spy.mockRestore();
		}
	});

	it("preloads exchange, transaction, and vote routes when path starts with /profile", () => {
		const rootSpies = [...DashboardRoutes, ...ProfileRoutes, ...SettingRoutes, ...ContactRoutes].map((route) =>
			vi.spyOn(route.component as any, "preload"),
		);

		const profileSpies = [...ExchangeRoutes, ...VoteRoutes].map((route) =>
			vi.spyOn(route.component as any, "preload"),
		);

		const commonSpies = [...TransactionRoutes, ...MessageRoutes].map((route) =>
			vi.spyOn(route.component as any, "preload"),
		);

		const canActivate = subject.handler({ location: { pathname: "/profiles" } } as any);

		expect(canActivate).toBe(true);

		for (const spy of rootSpies) {
			expect(spy).not.toHaveBeenCalled();
		}

		for (const spy of [...profileSpies, ...commonSpies]) {
			expect(spy).toHaveBeenCalledWith();
		}

		for (const spy of [...rootSpies, ...profileSpies, ...commonSpies]) {
			spy.mockRestore();
		}
	});
});
