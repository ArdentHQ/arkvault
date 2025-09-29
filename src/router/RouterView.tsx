import React, { FC, useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import { useEnvironmentContext } from "@/app/contexts";
import { RouteItem, Middleware } from "@/router/router.types";
import { RouteSuspense } from "@/router/RouteSuspense";
import { PreloadableComponent } from "@/utils/preload-lazy";
import { AppPanels, PanelsProvider } from "@/app/contexts/Panels";

interface Properties {
	routes: RouteItem[];
	middlewares?: Middleware[];
}

export const RouterView = ({ routes, middlewares = [] }: Properties) => {
	const navigate = useNavigate();
	const location = useLocation();

	const { env } = useEnvironmentContext();
	const [redirectUrl, setRedirectUrl] = useState<string | undefined>(undefined);
	const [canActivate, setCanActivate] = useState(true);

	const previousPath = useRef<string>("");

	useEffect(() => {
		if (previousPath.current !== location.pathname) {
			previousPath.current = location.pathname;
			window.scrollTo(0, 0);
		}
	}, [location.pathname]);

	useEffect(() => {
		const result = middlewares.every((middleware) =>
			middleware.handler({
				env,
				location,
				navigate,
				redirect: setRedirectUrl,
			}),
		);
		setCanActivate(result);
	}, [location, middlewares, env]);

	return (
		<PanelsProvider>
			<Routes>
				{routes.map((route, index) => {
					const elementToRender = canActivate ? (
						<div data-testid="RouterView__wrapper">
							{React.createElement(route.component as PreloadableComponent<FC<unknown>>)}
						</div>
					) : (
						<Navigate to={redirectUrl ?? "/"} replace />
					);

					return (
						<Route
							key={index}
							path={route.path}
							element={
								<RouteSuspense skeleton={route.skeleton} path={route.path}>
									{elementToRender}
								</RouteSuspense>
							}
						/>
					);
				})}
			</Routes>

			<AppPanels />
		</PanelsProvider>
	);
};
