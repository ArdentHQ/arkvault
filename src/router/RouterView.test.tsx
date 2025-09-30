import React, { useEffect } from "react";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
import { renderWithoutRouter as render, screen } from "@/utils/testing-library";
import { RouterView } from "./RouterView";
import { Middleware } from "./router.types";
import * as PanelsMock from "@/app/Panels.blocks";
import { afterAll, beforeAll, vi } from "vitest";

let appPanelsMock;

const NavigateAfterMount = ({ to }) => {
	const navigate = useNavigate();

	useEffect(() => {
		navigate(to);
	}, [navigate, to]);

	return null;
};

describe("RouterView", () => {
	const Home = () => <div data-testid="home">Home</div>;
	const First = () => <div data-testid="first">First</div>;
	const Second = () => <div data-testid="second">Second</div>;

	beforeAll(() => {
		appPanelsMock = vi.spyOn(PanelsMock, "AppPanels").mockImplementation(() => <></>);
	});

	afterAll(() => {
		appPanelsMock.mockRestore();
	});

	it("should render", () => {
		render(
			<MemoryRouter initialEntries={["/"]}>
				<RouterView routes={[{ component: Home, path: "/" }]} />
			</MemoryRouter>,
		);
		expect(screen.getByTestId("home")).toBeInTheDocument();
	});

	it("should scroll to top on route change", () => {
		const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation();

		render(
			<MemoryRouter initialEntries={["/first"]}>
				<Routes>
					<Route
						path="*"
						element={
							<RouterView
								routes={[
									{ component: First, path: "/first" },
									{ component: Second, path: "/second" },
								]}
								middlewares={[]}
							/>
						}
					/>
				</Routes>
				<Routes>
					<Route path="/first" element={<NavigateAfterMount to="/second" />} />
				</Routes>
			</MemoryRouter>,
		);

		expect(scrollSpy).toHaveBeenCalledWith(0, 0);
		scrollSpy.mockRestore();
	});

	it("should not scroll to top when route does not change", () => {
		const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation();

		render(
			<MemoryRouter initialEntries={["/only"]}>
				<RouterView routes={[{ component: Home, path: "/only" }]} middlewares={[]} />
			</MemoryRouter>,
		);

		scrollSpy.mockClear();

		expect(scrollSpy).not.toHaveBeenCalled();
		scrollSpy.mockRestore();
	});

	it("should block /test router", () => {
		const blocker: Middleware = {
			handler: ({ location, redirect }) => {
				if (location.pathname === "/test") {
					redirect("/");
					return false;
				}
				return true;
			},
		};

		render(
			<MemoryRouter initialEntries={["/test"]}>
				<RouterView
					routes={[
						{ component: First, path: "/test" },
						{ component: Home, path: "/" },
					]}
					middlewares={[blocker]}
				/>
			</MemoryRouter>,
		);

		expect(screen.getByTestId("home")).toBeInTheDocument();
		expect(screen.queryByTestId("first")).toBeNull();
	});

	it("should block /test route and redirect to a custom url", () => {
		const customRedirect: Middleware = {
			handler: ({ location, redirect }) => {
				if (location.pathname === "/test") {
					redirect("/custom");
					return false;
				}
				return true;
			},
		};

		const Custom = () => <div data-testid="custom">Custom</div>;

		render(
			<MemoryRouter initialEntries={["/test"]}>
				<RouterView
					routes={[
						{ component: First, path: "/test" },
						{ component: Custom, path: "/custom" },
					]}
					middlewares={[customRedirect]}
				/>
			</MemoryRouter>,
		);

		expect(screen.getByTestId("custom")).toBeInTheDocument();
		expect(screen.queryByTestId("first")).toBeNull();
	});

	it("should render when middleware sets redirect but allows activation", () => {
		const alwaysRedirect: Middleware = {
			handler: ({ redirect }) => {
				redirect("/ignored");
				return true;
			},
		};

		render(
			<MemoryRouter initialEntries={["/allowed"]}>
				<RouterView routes={[{ component: Home, path: "/allowed" }]} middlewares={[alwaysRedirect]} />
			</MemoryRouter>,
		);

		expect(screen.getByTestId("home")).toBeInTheDocument();
	});

	it("should include wrapper div when activation is allowed", () => {
		render(
			<MemoryRouter initialEntries={["/"]}>
				<RouterView routes={[{ component: Home, path: "/" }]} />
			</MemoryRouter>,
		);

		expect(screen.getByTestId("RouterView__wrapper")).toBeInTheDocument();
		expect(screen.getByTestId("home")).toBeInTheDocument();
	});
});
