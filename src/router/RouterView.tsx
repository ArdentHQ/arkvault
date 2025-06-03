import React, { FC, useEffect, useMemo, useRef } from "react";
import {
	Navigate,
	Route,
	Routes,
	useLocation,
	useNavigate,
} from "react-router-dom";

import { useEnvironmentContext } from "@/app/contexts";
import { RouteItem, Middleware } from "@/router/router.types";
import { RouteSuspense } from "@/router/RouteSuspense";
import { PreloadableComponent } from "@/utils/preload-lazy";

interface Properties {
	routes: RouteItem[];
	middlewares?: Middleware[];
}

export const RouterView = ({ routes, middlewares = [] }: Properties) => {
	const navigate = useNavigate()
	const location = useLocation();

	const { env } = useEnvironmentContext();
	const [redirectUrl, setRedirectUrl] = React.useState<string | undefined>(
		undefined
	);

	// Instead of history.listen, just scroll to top whenever the pathname changes.
	// (React Router v6 no longer exposes history.listen on the returned navigate function.)
	const previousPath = useRef<string>("");

	useEffect(() => {
		if (previousPath.current !== location.pathname) {
			previousPath.current = location.pathname;
			window.scrollTo(0, 0);
		}
	}, [location.pathname]);

	// Run all middlewares whenever location, env, or navigate changes.
	// If any middleware sets redirect via setRedirectUrl, canActivate will be false.
	const canActivate = useMemo(
		() =>
			middlewares.every((middleware) =>
				// Each middleware.handler should return true/false and may call setRedirectUrl(…)
				middleware.handler({
					env,
					location,
					redirect: setRedirectUrl,
					navigate,
				})
			),
		[location, middlewares, env]
	);

	return (
		<Routes>
			{routes.map((route, index) => {
				// Determine what to render: either the wrapped component or a <Navigate>.
				const elementToRender = canActivate ? (
					<div data-testid="RouterView__wrapper">
						{React.createElement(
							route.component as PreloadableComponent<FC<unknown>>
						)}
					</div>
				) : (
					<Navigate to={redirectUrl ?? "/"} replace />
				);

				// Wrap it all in your <RouteSuspense> and pass that as element.
				return (
					<Route
						key={index}
						path={route.path}
						element={
							<RouteSuspense skeleton={route.skeleton} path={route.path}>
								{elementToRender}
							</RouteSuspense>
						}
					// In v6+, the “exact” prop is removed; RRD v6 matches exactly by default unless you use wildcards.
					/>
				);
			})}
		</Routes>
	);
};
