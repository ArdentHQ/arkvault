import React from "react";
import cn from "classnames";

export const TableWrapper = ({ className, children }: { className?: string; children: React.ReactNode }) => (
	<div
		className={cn(
			"rounded-xl border border-b-[5px] border-transparent md:border-theme-secondary-300 dark:md:border-theme-secondary-800",
			className,
		)}
		data-testid="TableWrapper"
	>
		{children}
	</div>
);
