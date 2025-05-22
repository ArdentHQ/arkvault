import React from "react";
import cn from "classnames";
import { Spinner } from "@/app/components/Spinner";

export const Loader = ({ text, className }: { text: string; className?: string }) => (
	<div
		className={cn(
			"border-theme-warning-200 bg-theme-warning-50 dark:border-theme-warning-600 flex w-full flex-row items-center gap-3 rounded-xl border px-6 py-5 dark:bg-transparent",
			className,
		)}
		data-testid="Loader__wrapper"
	>
		<Spinner color="warning-alt" size="sm" className="rounded-full" width={3} />
		<hr className="w-px h-5 border-transparent bg-theme-warning-200 dark:bg-theme-secondary-800" />
		<span
			className="text-sm font-semibold md:text-base text-theme-secondary-700 dark:text-theme-warning-600"
			data-testid="Loader__text"
		>
			{text}
		</span>
	</div>
);
