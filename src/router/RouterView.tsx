import React, { createElement, FC, useMemo } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { styled } from "twin.macro";

import { useEnvironmentContext } from "@/app/contexts";
import { RouteItem, Middleware } from "@/router/router.types";
import { RouteSuspense } from "@/router/RouteSuspense";
import { PreloadableComponent } from "@/utils/preload-lazy";

interface Properties {
	routes: RouteItem[];
	middlewares?: Middleware[];
}

const Wrapper = styled.div();

export const RouterView: React.VFC<Properties> = ({ routes, middlewares = [] }) => {
	const location = useLocation();

	const { env } = useEnvironmentContext();
	const [_redirectUrl, setRedirectUrl] = React.useState<string | undefined>(undefined);

	// const previousPath = useRef("");

	// useEffect(() => {
	// 	history.listen((route) => {
	// 		// @ts-ignore
	// 		if (!previousPath.current || route.location?.pathname !== previousPath.current) {
	// 			// @ts-ignore
	// 			previousPath.current = route.location?.pathname;
	// 			window.scrollTo(0, 0);
	// 		}
	// 	});
	// }, [history]);

	const canActivate = useMemo(
		() =>
			// @ts-ignore
			middlewares.every((middleware) => middleware.handler({ env, location, redirect: setRedirectUrl })),
		[location, middlewares, env],
	);

	return (
		<Routes>
			{routes.map((route, index) => (
				<Route key={index} path={route.path}>
					<RouteSuspense skeleton={route.skeleton} path={route.path}>
						{canActivate ? (
							<Wrapper data-testid="RouterView__wrapper">
								{createElement(route.component as PreloadableComponent<FC<unknown>>)}
							</Wrapper>
						) : (
							<></>
							// <Redirect to={redirectUrl ?? "/"} />
						)}
					</RouteSuspense>
				</Route>
			))}
		</Routes>
	);
};
