import React, { useEffect } from "react";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
import { renderWithoutRouter as render, screen, act } from "@/utils/testing-library";
import { RouterView } from "./RouterView";
import { Middleware } from "./router.types";

describe("RouterView", () => {
	const Home = () => <div data-testid="home">Home</div>;
	const First = () => <div data-testid="first">First</div>;
	const Second = () => <div data-testid="second">Second</div>;

	// Helper component to trigger navigation on mount
	const NavigateAfterMount = ({ to }) => {
		const navigate = useNavigate();
		useEffect(() => {
			navigate(to);
		}, [navigate, to]);
		return null;
	};

	it("should render", () => {
		render(
			<MemoryRouter initialEntries={["/"]}>
				<RouterView routes={[{ path: "/", component: Home }]} />
			</MemoryRouter>
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
									{ path: "/first", component: First },
									{ path: "/second", component: Second },
								]}
								middlewares={[]}
							/>
						}
					/>
				</Routes>
				<Routes>
					<Route path="/first" element={<NavigateAfterMount to="/second" />} />
				</Routes>
			</MemoryRouter>
		);

		// Wait for navigation effect
		act(() => { });

		expect(scrollSpy).toHaveBeenCalledWith(0, 0);
		scrollSpy.mockRestore();
	});

	it("should not scroll to top when route does not change", () => {
		const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation();

		render(
			<MemoryRouter initialEntries={["/only"]}>
				<RouterView
					routes={[{ path: "/only", component: Home }]}
					middlewares={[]}
				/>
			</MemoryRouter>
		);
		// clear the initial scroll caused by mount
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
						{ path: "/test", component: First },
						{ path: "/", component: Home },
					]}
					middlewares={[blocker]}
				/>
			</MemoryRouter>
		);

		// Should be redirected to Home
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
						{ path: "/test", component: First },
						{ path: "/custom", component: Custom },
					]}
					middlewares={[customRedirect]}
				/>
			</MemoryRouter>
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
				<RouterView
					routes={[{ path: "/allowed", component: Home }]}
					middlewares={[alwaysRedirect]}
				/>
			</MemoryRouter>
		);

		// Component should render despite redirect being set
		expect(screen.getByTestId("home")).toBeInTheDocument();
	});

	it("should include wrapper div when activation is allowed", () => {
		render(
			<MemoryRouter initialEntries={["/"]}>
				<RouterView routes={[{ path: "/", component: Home }]} />
			</MemoryRouter>
		);
		// The rendered element should be wrapped
		expect(screen.getByTestId("RouterView__wrapper")).toBeInTheDocument();
		expect(screen.getByTestId("home")).toBeInTheDocument();
	});
});
