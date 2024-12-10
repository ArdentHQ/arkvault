import { css as cssImport } from "@emotion/react";
import { CSSInterpolation } from "@emotion/serialize";
import styledImport from "@emotion/styled";

declare module "*.svg" {
	import React = require("react");
	export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
	const src: string;
	export default src;
}

declare module "password-pwnd" {
	const pwnd: (value: string) => Promise<number>;
	const strong: (value: string) => Promise<1 | 0>;
}

declare module "react" {
	// The css prop
	interface HTMLAttributes<T> extends DOMAttributes<T> {
		css?: CSSInterpolation;
		tw?: string;
	}
	// The inline svg css prop
	interface SVGProps<T> extends SVGProps<SVGSVGElement> {
		css?: CSSInterpolation;
		tw?: string;
	}
}
