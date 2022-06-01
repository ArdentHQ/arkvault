import "./styles/app.css";

import React from "react";
import ReactDOM from "react-dom";

import { App } from "@/app/App";

// Based on https://github.com/fvilers/disable-react-devtools.
if (process.env.NODE_ENV && ["development", "production"].includes(process.env.NODE_ENV)) {
	const isFunction = (value: unknown): boolean => typeof value == "function" || false;
	const isObject = (value: unknown): boolean => typeof value === "function" || (typeof value === "object" && !!value);

	// @ts-ignore
	if (isObject(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)) {
		// @ts-ignore
		for (const property in window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
			// @ts-ignore
			window.__REACT_DEVTOOLS_GLOBAL_HOOK__[property] = isFunction(
				// @ts-ignore
				window.__REACT_DEVTOOLS_GLOBAL_HOOK__[property],
			)
				? Function.prototype
				: undefined;
		}
	}
}

ReactDOM.render(<App />, document.querySelector("#root"));
