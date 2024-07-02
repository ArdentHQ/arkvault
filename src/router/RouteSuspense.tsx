import React, { createElement, FunctionComponent, Suspense } from "react";

import { PageSkeleton } from "@/app/components/PageSkeleton";
import { ProfilePageSkeleton } from "@/app/components/PageSkeleton/ProfilePageSkeleton";

interface RouteSuspenseProperties {
	skeleton?: FunctionComponent;
	path: string;
	children?: React.ReactNode;
}

export const RouteSuspense = ({ children, skeleton, path }: RouteSuspenseProperties) => {
	let fallback = <PageSkeleton />;
	if (skeleton) {
		fallback = createElement(skeleton);
	} else if (path.startsWith("/profiles")) {
		fallback = <ProfilePageSkeleton />;
	}

	return <Suspense fallback={fallback}>{children}</Suspense>;
};
