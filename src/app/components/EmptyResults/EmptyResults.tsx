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
		className={cn("flex h-full flex-col justify-center bg-theme-background text-center", className)}
		data-testid="EmptyResults"
	>
		<div>
			{title && <div className="mb-4 text-lg font-bold">{title}</div>}
			{subtitle && <div className="text-md mb-8">{subtitle}</div>}
			<div className="mx-auto max-w-full">
				<Image name="NoResults" />
			</div>
		</div>
	</div>
);
