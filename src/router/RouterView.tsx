import React, { createElement, FC, useEffect, useMemo, useRef } from "react";
import { Redirect, Route, Switch, useHistory, useLocation } from "react-router-dom";

import { useEnvironmentContext } from "@/app/contexts";
import { RouteItem, Middleware } from "@/router/router.types";
import { RouteSuspense } from "@/router/RouteSuspense";
import { PreloadableComponent } from "@/utils/preload-lazy";

interface Properties {
	routes: RouteItem[];
	middlewares?: Middleware[];
}

export const RouterView: React.VFC<Properties> = ({ routes, middlewares = [] }) => {
	const location = useLocation();
	const history = useHistory();
	const { env } = useEnvironmentContext();
	const [redirectUrl, setRedirectUrl] = React.useState<string | undefined>(undefined);

	const previousPath = useRef("");

	useEffect(() => {
		history.listen((route) => {
			// @ts-ignore
			if (!previousPath.current || route.location?.pathname !== previousPath.current) {
				// @ts-ignore
				previousPath.current = route.location?.pathname;
				window.scrollTo(0, 0);
			}
		});
	}, [history]);

	const canActivate = useMemo(
		() =>
			// @ts-ignore
			middlewares.every((middleware) => middleware.handler({ env, history, location, redirect: setRedirectUrl })),
		[location, middlewares, env, history],
	);

	return (
		<Switch>
			{routes.map((route, index) => (
				<Route key={index} path={route.path} exact={route.exact}>
					<RouteSuspense skeleton={route.skeleton} path={route.path}>
						{canActivate ? (
							<div data-testid="RouterView__wrapper">
								{createElement(route.component as PreloadableComponent<FC<unknown>>)}
							</div>
						) : (
							<Redirect to={redirectUrl ?? "/"} />
						)}
					</RouteSuspense>
				</Route>
			))}
		</Switch>
	);
};
