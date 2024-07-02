/* eslint-disable react/display-name */
import { createHashHistory } from "history";
import React from "react";
import { MemoryRouter, Router, withRouter } from "react-router-dom";

import { render, screen } from "@/utils/testing-library";

import { Middleware, MiddlewareParameters } from "./router.types";
import { RouterView } from "./RouterView";

describe("RouterView", () => {
	const LocationDisplay = withRouter(({ location }) => (
		// @ts-ignore
		<div data-testid="location-display">{location.location?.pathname || location.pathname}</div>
	));

	it("should render", () => {
		const { asFragment } = render(
			<MemoryRouter>
				<RouterView routes={[{ component: () => <h1>Test</h1>, path: "/" }]} />
			</MemoryRouter>,
		);

		expect(screen.getByTestId("RouterView__wrapper")).toHaveTextContent("Test");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should scroll to top on route change", () => {
		const windowSpy = vi.spyOn(window, "scrollTo");

		const history = createHashHistory();
		history.push("/test");

		render(
			<Router history={history}>
				<RouterView
					routes={[
						{ component: () => <h1>Test 1</h1>, path: "/test" },
						{ component: () => <h1>Test 2</h1>, path: "/test2" },
					]}
				/>
			</Router>,
		);

		history.push("/test2");
		history.replace("/test");

		expect(windowSpy).toHaveBeenCalledTimes(2);
	});

	it("should not scroll to top when route does not change", () => {
		const windowSpy = vi.spyOn(window, "scrollTo");

		const history = createHashHistory();
		history.push("/test");

		render(
			<Router history={history}>
				<RouterView routes={[{ component: () => <h1>Test</h1>, path: "/test" }]} />
			</Router>,
		);

		history.push("/test");
		history.replace("/test");

		expect(windowSpy).toHaveBeenCalledTimes(1);
	});

	it("should block /test router", () => {
		const handler = vi.fn(({ location }: MiddlewareParameters) => location.pathname !== "/test");

		const testMiddleware: Middleware = { handler };
		const history = createHashHistory();
		history.replace("/test");

		render(
			<Router history={history}>
				<RouterView
					routes={[
						{ component: () => <h1>Test</h1>, path: "/test" },
						{ component: () => <h1>Home</h1>, path: "/" },
					]}
					middlewares={[testMiddleware]}
				/>
			</Router>,
		);

		expect(handler).toHaveBeenCalledTimes(2);
	});

	it("should block /test route and redirect to a custom url", () => {
		const handler = vi.fn(({ location, redirect }: MiddlewareParameters) => {
			if (location.pathname === "/test") {
				redirect("/custom");
				return false;
			}
			return true;
		});

		const testMiddleware: Middleware = {
			handler,
		};

		const history = createHashHistory();
		history.push("/test");

		render(
			<Router history={history}>
				<>
					<RouterView
						routes={[
							{ component: () => <h1>Test</h1>, path: "/test" },
							{ component: () => <h1>Custom</h1>, path: "/custom" },
						]}
						middlewares={[testMiddleware]}
					/>
					<LocationDisplay />
				</>
			</Router>,
		);

		expect(handler).toHaveBeenCalledTimes(2);
		expect(screen.getByTestId("location-display")).toHaveTextContent("/custom");
	});
});
