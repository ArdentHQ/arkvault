import { ComponentType, FC, LazyExoticComponent } from "react";
import { RouteProps } from "react-router";
import { Environment } from "@ardenthq/sdk-profiles";
import { History, Location } from "history";
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
	history: History;
}

type LocationState = { from?: string } | undefined;

interface Middleware {
	handler(parameters: MiddlewareParameters): boolean;
}

export type { RouteItem, Middleware, MiddlewareParameters, LocationState };
