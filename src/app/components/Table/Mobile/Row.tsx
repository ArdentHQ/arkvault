import cn from "classnames";
import React from "react";

export const RowWrapper = ({ children }: { children: React.ReactNode }) => (
	<div className="flex justify-between items-center space-x-4">{children}</div>
);

export const RowLabel = ({ children }: { children: React.ReactNode }) => (
	<div className="relative m-0 font-semibold text-left select-none first:pl-0 last:pr-0 text-md group border-theme-secondary-300 text-theme-secondary-700 dark:border-theme-secondary-800 dark:text-theme-secondary-500">
		{children}
	</div>
);

interface Properties {
	children: React.ReactNode;
	innerClassName?: string;
}

export const ResponsiveAddressWrapper: React.FC<Properties> = ({ children, innerClassName }) => (
	<div className="flex w-full text-right">
		<div className={cn("flex w-0 flex-1 items-center justify-end overflow-hidden", innerClassName)}>{children}</div>
	</div>
);
