import React from "react";
import cn from "classnames";
import { Spinner } from "@/app/components/Spinner";

export const Loader = ({
	text,
	className,
	"data-testid": dataTestid,
}: {
	text: string;
	className?: string;
	"data-testid"?: string;
}) => (
	<div
		className={cn(
			"border-theme-warning-200 bg-theme-warning-50 dark:border-theme-warning-600 flex w-full flex-row items-center gap-3 rounded-xl border px-6 py-5 dark:bg-transparent",
			className,
		)}
		data-testid={dataTestid || "Loader__wrapper"}
	>
		<Spinner color="warning-alt" size="sm" className="rounded-full" width={3} />
		<hr className="bg-theme-warning-200 dark:bg-theme-secondary-800 h-5 w-px border-transparent" />
		<span
			className="text-theme-secondary-700 dark:text-theme-warning-600 text-sm font-semibold md:text-base"
			data-testid="Loader__text"
		>
			{text}
		</span>
	</div>
);
