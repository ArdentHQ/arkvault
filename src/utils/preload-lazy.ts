import React from "react";
import type { ComponentType } from "react";

export type PreloadableComponent<T extends ComponentType<unknown>> = T & {
	preload: () => Promise<void>;
};

export default function preloadLazy<T extends ComponentType<unknown>>(
	factory: () => Promise<{ default: T }>,
): PreloadableComponent<T> {
	const LazyComponent = React.lazy(factory);
	let factoryPromise: Promise<void> | undefined;
	let LoadedComponent: T | undefined;

	const Component = React.forwardRef(function LazyWithPreload(properties, reference) {
		return React.createElement(
			// @ts-ignore
			LoadedComponent ?? LazyComponent,
			Object.assign(reference ? { ref: reference } : {}, properties) as any,
		);
	}) as any as PreloadableComponent<T>;

	Component.preload = () => {
		if (!factoryPromise) {
			// eslint-disable-next-line promise/always-return
			factoryPromise = factory().then((module) => {
				LoadedComponent = module.default;
			});
		}

		return factoryPromise;
	};

	return Component;
}
