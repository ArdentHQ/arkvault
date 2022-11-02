import React, { CSSProperties } from "react";
import SkeletonReact from "react-loading-skeleton";

interface SkeletonProperties {
	count?: number;
	duration?: number;
	width?: string | number;
	height?: string | number;
	circle?: boolean;
	style?: CSSProperties;
	className?: string;
}

export const Skeleton = (properties: SkeletonProperties) => (
	<SkeletonReact
		{...properties}
		containerClassName="flex w-full max-w-full items-center overflow-hidden leading-none"
	/>
);
