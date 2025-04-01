import React from "react";
import cn from "classnames";

interface TableWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
	noBorder?: boolean;
}

export const TableWrapper = ({ className, children, noBorder = false, ...properties }: TableWrapperProps) => (
	<div
		data-testid="TableWrapper"
		className={cn(
			"rounded-xl pb-2 outline outline-1 outline-transparent md:outline-theme-secondary-300 dark:md:border-theme-secondary-800 dark:md:outline-theme-secondary-800",
			{
				"border-b-none": noBorder,
				"border-transparent md:border-b-[5px] md:border-b-theme-secondary-200": !noBorder,
			},
			className,
		)}
		{...properties}
	>
		{children}
	</div>
);
