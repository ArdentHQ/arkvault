import React from "react";
import cn from "classnames";

export const Dot = ({ className }: { className?: string }) => (
	<div
		className={cn(
			"absolute top-1 right-1 flex items-center justify-center rounded-full bg-theme-background p-1 transition-all duration-100 ease-linear group-hover:bg-theme-primary-100 dark:group-hover:bg-theme-secondary-800",
			className,
		)}
	>
		<div className="h-2 w-2 rounded-full bg-theme-danger-500" />
	</div>
);
