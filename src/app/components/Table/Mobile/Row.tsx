import cn from "classnames";
import React from "react";

export const RowWrapper: React.FC = ({ children }) => (
	<div className="flex items-center justify-between space-x-4">{children}</div>
);

export const RowLabel: React.FC = ({ children }) => (
	<div className="text-md group relative m-0 select-none border-theme-secondary-300 text-left font-semibold text-theme-secondary-700 first:pl-0 last:pr-0 dark:border-theme-secondary-800 dark:text-theme-secondary-500">
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
