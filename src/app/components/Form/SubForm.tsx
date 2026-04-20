import React from "react";
import { twMerge } from "tailwind-merge";
import cn from "classnames";

const SubFormWrapper = ({
	noPadding,
	noBorder,
	...props
}: React.HTMLAttributes<HTMLDivElement> & { noBorder?: boolean; noPadding?: boolean }) => (
	<div
		{...props}
		className={twMerge(
			"space-y-4 rounded-lg",
			cn({
				"-mx-4 p-4": !noPadding,
				"border-theme-secondary-300 border-b-theme-secondary-200 dark:border-theme-secondary-800 dim:border-theme-dim-700 border border-b-[5px]":
					!noBorder,
			}),
			props.className,
		)}
	/>
);

export const SubForm = ({
	className,
	children,
	noBorder,
	noPadding,
}: {
	className?: string;
	children: React.ReactNode;
	noBorder?: boolean;
	noPadding?: boolean;
}) => (
	<SubFormWrapper className={className} noBorder={noBorder} noPadding={noPadding}>
		{children}
	</SubFormWrapper>
);
