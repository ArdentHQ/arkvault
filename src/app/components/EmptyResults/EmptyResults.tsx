import cn from "classnames";
import React from "react";

import { Image } from "@/app/components/Image";

interface EmptyResultsProperties {
	className?: string;
	title?: string;
	subtitle?: string;
}

export const EmptyResults = ({ className, title, subtitle }: EmptyResultsProperties) => (
	<div
		className={cn("bg-theme-background flex h-full flex-col justify-center text-center", className)}
		data-testid="EmptyResults"
	>
		<div>
			{title && <div className="dim:text-theme-dim-200 mb-4 text-lg font-bold">{title}</div>}
			{subtitle && <div className="text-md dim:text-theme-dim-500 mb-8">{subtitle}</div>}
			<div className="mx-auto w-full max-w-lg">
				<Image name="NoResults" />
			</div>
		</div>
	</div>
);
