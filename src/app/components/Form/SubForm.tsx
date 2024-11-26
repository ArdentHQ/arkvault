import React from "react";
import { twMerge } from "tailwind-merge";
import cn from 'classnames';

const SubFormWrapper = ({noPadding, noBackground, ...props}: React.HTMLAttributes<HTMLDivElement> & { noBackground?: boolean; noPadding?: boolean }) => (
		<div
			{...props}
			className={twMerge("space-y-4 rounded-lg", cn({
				"bg-theme-secondary-background": !noBackground,
				"p-4 -mx-4": !noPadding,
			}),props.className)}
		/>
	)

export const SubForm = ({
	className,
	children,
	noBackground,
	noPadding,
}: {
	className?: string;
	children: React.ReactNode;
	noBackground?: boolean;
	noPadding?: boolean;
}) => (
	<SubFormWrapper className={className} noBackground={noBackground} noPadding={noPadding}>
		{children}
	</SubFormWrapper>
);
