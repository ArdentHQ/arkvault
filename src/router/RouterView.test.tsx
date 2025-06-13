import React, { useEffect } from "react";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
import { render, screen, act, renderWithoutRouter } from "@/utils/testing-library";
import { RouterView } from "./RouterView";
import { Middleware } from "./router.types";

describe("RouterView", () => {
	const Home = () => <div data-testid="home">Home</div>;
	const First = () => <div data-testid="first">First</div>;
	const Second = () => <div data-testid="second">Second</div>;

	const NavigateAfterMount = ({ to }) => {
		const navigate = useNavigate();
		useEffect(() => {
			navigate(to);
		}, [navigate, to]);
		return null;
	};

	it("should render", () => {
		renderWithoutRouter(
			<MemoryRouter initialEntries={["/"]}>
				<RouterView routes={[{ path: "/", component: Home }]} />
			</MemoryRouter>
		);
		expect(screen.getByTestId("home")).toBeInTheDocument();
	});

	it("should scroll to top on route change", () => {
		const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation();

		renderWithoutRouter(
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

		expect(scrollSpy).toHaveBeenCalledWith(0, 0);
		scrollSpy.mockRestore();
	});

	it("should not scroll to top when route does not change", () => {
		const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation();

		render(<Home />);

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

		renderWithoutRouter(
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

		renderWithoutRouter(
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
});
