import React, { createElement, FC, useLayoutEffect, useMemo, useEffect, useRef } from "react";
import { Navigate, redirect, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { styled } from "twin.macro";

import { useEnvironmentContext } from "@/app/contexts";
import { RouteItem, Middleware } from "@/router/router.types";
import { RouteSuspense } from "@/router/RouteSuspense";
import { PreloadableComponent } from "@/utils/preload-lazy";
import { useLocaleCurrency } from "@/app/hooks";

interface Properties {
	routes: RouteItem[];
	middlewares?: Middleware[];
}

const Wrapper = styled.div();

export const RouterView: React.VFC<Properties> = ({ routes, middlewares = [] }) => {
	const location = useLocation();

	const navigate = useNavigate();

	const { env } = useEnvironmentContext();
	const [redirectUrl, setRedirectUrl] = React.useState<string | undefined>(undefined);

	const previousPath = useRef("");

	useEffect(() => {
		if (!previousPath.current || location?.pathname !== previousPath.current) {
			// @ts-ignore
			previousPath.current = location?.pathname;
			window.scrollTo(0, 0);
		}
	}, [location.pathname]);

	const canActivate = useMemo(
		() =>
			// @ts-ignore
			middlewares.every((middleware) => middleware.handler({ env, location, redirect: setRedirectUrl })),
		[location, middlewares, env],
	);

	useLayoutEffect(() => {
		if(!canActivate) {
			navigate(redirectUrl ?? "/");
		}

	}, [canActivate, redirectUrl])

	console.log(canActivate, redirectUrl)

	return (
		<Routes>
			{routes.map((route, index) => (
				<Route
					key={index}
					path={route.path}
					element={
						<RouteSuspense skeleton={route.skeleton} path={route.path}>
							{canActivate && (
								<Wrapper data-testid="RouterView__wrapper">
									{createElement(route.component as PreloadableComponent<FC<unknown>>)}
								</Wrapper>
							)}
						</RouteSuspense>
					}
				/>
			))}
		</Routes>
	);
};
