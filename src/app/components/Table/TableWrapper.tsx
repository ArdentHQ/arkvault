import React from "react";
import cn from "classnames";

interface TableWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
	noBorder?: boolean;
}

export const TableWrapper = ({ className, children, noBorder = false, ...properties }: TableWrapperProps) => (
	<div
		data-testid="TableWrapper"
		className={cn(
			"md:outline-theme-secondary-300 dark:md:border-theme-secondary-800 dark:md:outline-theme-secondary-800 dim:md:border-theme-dim-700 dim:md:outline-theme-dim-700 rounded-xl pb-2 outline outline-1 outline-transparent",
			{
				"border-b-none": noBorder,
				"md:border-b-theme-secondary-200 border-transparent md:border-b-[5px]": !noBorder,
			},
			className,
		)}
		{...properties}
	>
		{children}
	</div>
);
