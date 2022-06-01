import React, { createElement, FunctionComponent, Suspense } from "react";
import { PageSkeleton } from "@/app/components/PageSkeleton";
import { ProfilePageSkeleton } from "@/app/components/PageSkeleton/ProfilePageSkeleton";

interface RouteSuspenseProperties {
	skeleton?: FunctionComponent;
	path: string;
}

export const RouteSuspense: React.FC<RouteSuspenseProperties> = ({ children, skeleton, path }) => {
	let fallback = <PageSkeleton />;
	if (skeleton) {
		fallback = createElement(skeleton);
	} else if (path.startsWith("/profiles")) {
		fallback = <ProfilePageSkeleton />;
	}

	return <Suspense fallback={fallback}>{children}</Suspense>;
};
