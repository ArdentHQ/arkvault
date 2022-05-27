import React from "react";
import { useBreakpoint } from "@/app/hooks/use-breakpoint";

export const Xs = ({ children }: { children?: React.ReactNode }) => {
	const { isXs } = useBreakpoint();

	if (!isXs) {
		return null;
	}

	return <>{children}</>;
};

export const Sm = ({ children }: { children: React.ReactNode }) => {
	const { isSm } = useBreakpoint();

	if (!isSm) {
		return null;
	}

	return <>{children}</>;
};

export const Md = ({ children }: { children: React.ReactNode }) => {
	const { isMd } = useBreakpoint();

	if (!isMd) {
		return null;
	}

	return <>{children}</>;
};

export const Lg = ({ children }: { children: React.ReactNode }) => {
	const { isLg } = useBreakpoint();

	if (!isLg) {
		return null;
	}

	return <>{children}</>;
};

export const Xl = ({ children }: { children: React.ReactNode }) => {
	const { isXl } = useBreakpoint();

	if (!isXl) {
		return null;
	}

	return <>{children}</>;
};

export const SmAndAbove = ({ children }: { children: React.ReactNode }) => {
	const { isXs } = useBreakpoint();

	if (isXs) {
		return null;
	}

	return <>{children}</>;
};

export const MdAndAbove = ({ children }: { children: React.ReactNode }) => {
	const { isXs, isSm } = useBreakpoint();

	if (isXs || isSm) {
		return null;
	}

	return <>{children}</>;
};

export const SmAndBelow = ({ children }: { children: React.ReactNode }) => {
	const { isXs, isSm } = useBreakpoint();

	if (!isXs && !isSm) {
		return null;
	}

	return <>{children}</>;
};
