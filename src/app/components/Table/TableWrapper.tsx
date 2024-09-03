import React from "react";
import cn from "classnames";

export const TableWrapper = ({ className, children }: { className?: string; children: React.ReactNode }) => (
	<div
		className={cn(
			"hidden rounded-xl outline outline-1 outline-transparent sm:block md:outline-theme-secondary-300 dark:md:outline-theme-secondary-800 border-transparent md:border-b-[5px] md:border-b-theme-secondary-200 dark:md:border-theme-secondary-800",
			className,
		)}
		data-testid="TableWrapper"
	>
		{children}
	</div>
);
