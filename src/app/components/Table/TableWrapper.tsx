import React from "react";
import cn from "classnames";

export const TableWrapper = ({ className, children }: { className?: string; children: React.ReactNode }) => (
	<div
		className={cn(
			"rounded-xl border-transparent pb-2 outline outline-1 outline-transparent md:border-b-[5px] md:border-b-theme-secondary-200 md:outline-theme-secondary-300 dark:md:border-theme-secondary-800 dark:md:outline-theme-secondary-800",
			className,
		)}
		data-testid="TableWrapper"
	>
		{children}
	</div>
);
