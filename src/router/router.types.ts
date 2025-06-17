import { ComponentType, FC, LazyExoticComponent } from "react";
import { Location, NavigateFunction, RouteProps } from "react-router";
import { Environment } from "@/app/lib/profiles";
import { PreloadableComponent } from "@/utils/preload-lazy";

interface RouteItem {
	path: string;
	component: LazyExoticComponent<FC<RouteProps>> | PreloadableComponent<ComponentType<unknown>>;
	skeleton?: FC;
	exact: boolean;
}

interface MiddlewareParameters {
	location: Location;
	env: Environment;
	redirect: (url: string) => void;
	navigate: NavigateFunction;
}

type LocationState = { from?: string } | undefined;

interface Middleware {
	handler(parameters: MiddlewareParameters): boolean;
}

export type { RouteItem, Middleware, MiddlewareParameters, LocationState };
